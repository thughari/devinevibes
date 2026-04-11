package com.devinevibes.controller.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.service.order.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
public class WebhookController {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${shiprocket.webhook-token:}")
    private String shiprocketWebhookToken;

    public WebhookController(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<Void> razorpay(
            @RequestBody String rawBody,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        
        // 1. Verify Signature if secret is configured
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            try {
                boolean isValid = com.razorpay.Utils.verifyWebhookSignature(rawBody, signature, webhookSecret);
                if (!isValid) {
                    log.warn("SECURITY ALERT: Invalid Razorpay Webhook Signature received!");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            } catch (Exception e) {
                log.error("Error during Razorpay signature verification: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        // 2. Parse Raw JSON to Map
        Map<String, Object> requestBody;
        try {
            requestBody = objectMapper.readValue(rawBody, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse Razorpay webhook JSON: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }

        String event = (String) requestBody.get("event");
        log.info("Razorpay webhook received and verified: {}", event);
        
        Map<String, Object> payload = (Map<String, Object>) requestBody.get("payload");
        if (payload == null) {
            log.warn("Razorpay webhook missing 'payload' object");
            return ResponseEntity.ok().build();
        }

        try {
            switch (event) {
                case "order.paid" -> handleOrderPaid(payload);
                case "refund.processed", "refund.failed" -> handleRefundUpdate(payload, event);
                case "payment.failed" -> handlePaymentFailed(payload);
                default -> log.info("Ignoring Razorpay event: {}", event);
            }
        } catch (Exception e) {
            log.error("Error handling Razorpay webhook event {}: {}", event, e.getMessage());
        }

        return ResponseEntity.ok().build();
    }

    private void handleOrderPaid(Map<String, Object> payload) {
        String razorpayOrderId = null;
        String razorpayPaymentId = null;

        // Try extracting from order entity
        if (payload.containsKey("order")) {
            Map<String, Object> order = (Map<String, Object>) payload.get("order");
            Map<String, Object> entity = (Map<String, Object>) order.get("entity");
            if (entity != null) razorpayOrderId = (String) entity.get("id");
        }

        // Try extracting from payment entity
        if (payload.containsKey("payment")) {
            Map<String, Object> payment = (Map<String, Object>) payload.get("payment");
            Map<String, Object> entity = (Map<String, Object>) payment.get("entity");
            if (entity != null) {
                if (razorpayOrderId == null) razorpayOrderId = (String) entity.get("order_id");
                razorpayPaymentId = (String) entity.get("id");
            }
        }

        if (razorpayOrderId != null) {
            orderService.markPaymentSuccess(razorpayOrderId, razorpayPaymentId);
        }
    }

    private void handleRefundUpdate(Map<String, Object> payload, String event) {
        if (payload.containsKey("refund")) {
            Map<String, Object> refund = (Map<String, Object>) payload.get("refund");
            Map<String, Object> entity = (Map<String, Object>) refund.get("entity");
            if (entity != null) {
                String refundId = (String) entity.get("id");
                String status = (String) entity.get("status");
                orderService.processRefundUpdate(refundId, status);
            }
        }
    }

    private void handlePaymentFailed(Map<String, Object> payload) {
        if (payload.containsKey("payment")) {
            Map<String, Object> payment = (Map<String, Object>) payload.get("payment");
            Map<String, Object> entity = (Map<String, Object>) payment.get("entity");
            if (entity != null) {
                String razorpayOrderId = (String) entity.get("order_id");
                String reason = (String) entity.get("error_description");
                orderService.handlePaymentFailure(razorpayOrderId, reason);
            }
        }
    }

    /**
     * Shiprocket webhook endpoint.
     * Payload fields: awb, current_status, current_status_id, shipment_status, order_id, etc.
     */
    @PostMapping("/logistics")
    public ResponseEntity<Void> logistics(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "x-api-key", required = false) String apiKey) {
        
        // 1. Token Verification
        if (shiprocketWebhookToken != null && !shiprocketWebhookToken.isBlank()) {
            if (!shiprocketWebhookToken.equals(apiKey)) {
                log.warn("SECURITY ALERT: Invalid Shiprocket Webhook Token received!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        log.info("Shiprocket webhook received and verified: {}", payload);

        // Shiprocket sends AWB number (the tracking ID we store on our Order)
        Object awbRaw = payload.get("awb");
        String awb = awbRaw != null ? String.valueOf(awbRaw) : null;

        String currentStatus = (String) payload.get("current_status");

        if (awb == null || awb.isBlank() || currentStatus == null || currentStatus.isBlank()) {
            log.warn("Shiprocket webhook missing or empty required fields. awb={}, current_status={}", awb, currentStatus);
            return ResponseEntity.ok().build(); // Use OK to stop retries if data is invalid
        }

        OrderStatus orderStatus = mapShiprocketStatus(currentStatus);
        if (orderStatus == null) {
            log.info("Ignoring unmapped Shiprocket status: '{}' for AWB {}", currentStatus, awb);
            return ResponseEntity.ok().build();
        }

        String courierName = (String) payload.get("courier_name");

        try {
            orderService.updateLogisticsStatus(awb, orderStatus, courierName);
        } catch (com.devinevibes.exception.OrderNotFoundException e) {
            log.warn("No order found for AWB {}. Possibly a test webhook or already-removed order.", awb);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Maps Shiprocket's current_status string to our OrderStatus enum.
     * Returns null for statuses we don't need to act on (e.g. intermediate hub scans).
     */
    private OrderStatus mapShiprocketStatus(String shiprocketStatus) {
        return switch (shiprocketStatus.toUpperCase()) {
            case "PICKED UP", "SHIPPED", "IN TRANSIT" -> OrderStatus.SHIPPED;
            case "DELIVERED" -> OrderStatus.DELIVERED;
            case "CANCELED", "CANCELLED", "RTO INITIATED", "RTO DELIVERED" -> OrderStatus.CANCELLED;
            default -> null; // Ignore intermediate statuses like "Out for Delivery", "Arrived at hub", etc.
        };
    }
}
