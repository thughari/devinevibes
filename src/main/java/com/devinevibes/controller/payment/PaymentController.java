package com.devinevibes.controller.payment;

import com.devinevibes.dto.payment.CreatePaymentRequest;
import com.devinevibes.dto.payment.PaymentResponse;
import com.devinevibes.dto.payment.PaymentWebhookRequest;
import com.devinevibes.dto.payment.SignedUrlResponse;
import com.devinevibes.service.payment.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public PaymentResponse create(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @PostMapping("/webhook")
    public PaymentResponse webhook(@Valid @RequestBody PaymentWebhookRequest request) {
        return paymentService.handleWebhook(request);
    }

    @GetMapping("/signed-url")
    public SignedUrlResponse signedUrl(@RequestParam String fileName) {
        return paymentService.generateSignedUploadUrl(fileName);
    }
}
