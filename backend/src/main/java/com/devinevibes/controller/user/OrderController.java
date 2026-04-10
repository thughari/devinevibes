package com.devinevibes.controller.user;

import com.devinevibes.dto.order.OrderRequest;
import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.TrackingResponse;
import com.devinevibes.dto.payment.CreatePaymentOrderResponse;
import com.devinevibes.dto.payment.VerifyPaymentRequest;
import com.devinevibes.service.order.OrderService;
import com.devinevibes.service.payment.PaymentService;
import com.devinevibes.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    public OrderController(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @GetMapping("/razorpay-key")
    public ResponseEntity<java.util.Map<String, String>> getRazorpayKey() {
        return ResponseEntity.ok(java.util.Map.of("key", razorpayKeyId));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(SecurityUtils.currentPrincipalEmail(), request));
    }

    @PostMapping("/{orderId}/payment-order")
    public ResponseEntity<CreatePaymentOrderResponse> createPaymentOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> get() {
        return ResponseEntity.ok(orderService.getMyOrders(SecurityUtils.currentPrincipalEmail()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getMyOrderById(SecurityUtils.currentPrincipalEmail(), id));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<TrackingResponse> tracking(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getTracking(SecurityUtils.currentPrincipalEmail(), id));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Void> verifyPayment(@PathVariable String id, @Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyRazorpayPayment(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<java.util.Map<String, String>> cancel(@PathVariable String id) {
        orderService.cancelOrder(SecurityUtils.currentPrincipalEmail(), id);
        return ResponseEntity.ok(java.util.Map.of("message", "Order cancelled and stock restored"));
    }
}
