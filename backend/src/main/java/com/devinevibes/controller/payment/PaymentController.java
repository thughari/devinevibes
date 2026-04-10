package com.devinevibes.controller.payment;

import com.devinevibes.dto.payment.CreatePaymentOrderResponse;
import com.devinevibes.service.payment.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<CreatePaymentOrderResponse> createOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }
}
