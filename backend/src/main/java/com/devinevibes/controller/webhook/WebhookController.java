package com.devinevibes.controller.webhook;

import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.service.order.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
public class WebhookController {

    private final OrderService orderService;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<Void> razorpay(@RequestBody Map<String, Object> payload) {
        String razorpayOrderId = (String) payload.get("razorpay_order_id");
        String razorpayPaymentId = (String) payload.get("razorpay_payment_id");
        orderService.markPaymentSuccess(razorpayOrderId, razorpayPaymentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Shiprocket webhook endpoint.
     * Payload fields: awb, current_status, current_status_id, shipment_status, order_id, etc.
     */
    @PostMapping("/logistics")
    public ResponseEntity<Void> logistics(@RequestBody Map<String, Object> payload) {
        log.info("Shiprocket webhook received: {}", payload);

        // Shiprocket sends AWB number (the tracking ID we store on our Order)
        Object awbRaw = payload.get("awb");
        String awb = awbRaw != null ? String.valueOf(awbRaw) : null;

        String currentStatus = (String) payload.get("current_status");

        if (awb == null || currentStatus == null) {
            log.warn("Shiprocket webhook missing required fields. awb={}, current_status={}", awb, currentStatus);
            return ResponseEntity.badRequest().build();
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
