package com.devinevibes.controller.user;

import com.devinevibes.dto.order.OrderRequest;
import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.TrackingResponse;
import com.devinevibes.dto.payment.CreatePaymentOrderResponse;
import com.devinevibes.service.order.OrderService;
import com.devinevibes.service.payment.PaymentService;
import com.devinevibes.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    public OrderController(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest ignored) {
        return ResponseEntity.ok(orderService.createOrder(SecurityUtils.currentPrincipalEmail()));
    }

    @PostMapping("/{orderId}/payment-order")
    public ResponseEntity<CreatePaymentOrderResponse> createPaymentOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> get() {
        return ResponseEntity.ok(orderService.getMyOrders(SecurityUtils.currentPrincipalEmail()));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<TrackingResponse> tracking(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getTracking(SecurityUtils.currentPrincipalEmail(), id));
    }
}
