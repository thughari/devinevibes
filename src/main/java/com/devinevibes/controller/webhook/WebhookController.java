package com.devinevibes.controller.webhook;

import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.service.order.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
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

    @PostMapping("/logistics")
    public ResponseEntity<Void> logistics(@RequestBody Map<String, Object> payload) {
        String trackingId = (String) payload.get("tracking_id");
        OrderStatus status = OrderStatus.valueOf(((String) payload.get("order_status")).toUpperCase());
        orderService.updateLogisticsStatus(trackingId, status);
        return ResponseEntity.ok().build();
    }
}
