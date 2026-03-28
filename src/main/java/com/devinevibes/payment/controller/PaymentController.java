package com.devinevibes.payment.controller;

import com.devinevibes.payment.dto.PaymentDtos;
import com.devinevibes.payment.entity.Payment;
import com.devinevibes.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public Payment create(@Valid @RequestBody PaymentDtos.CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @PostMapping("/webhook")
    public Payment webhook(@Valid @RequestBody PaymentDtos.PaymentWebhookRequest request) {
        return paymentService.handleWebhook(request);
    }

    @PostMapping("/signed-upload-url")
    public Map<String, String> signedUrl(@Valid @RequestBody PaymentDtos.SignedUploadUrlRequest request) {
        return paymentService.getSignedUploadUrl(request);
    }
}
