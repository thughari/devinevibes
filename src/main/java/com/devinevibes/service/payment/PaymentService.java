package com.devinevibes.service.payment;

import com.devinevibes.dto.payment.CreatePaymentRequest;
import com.devinevibes.dto.payment.PaymentResponse;
import com.devinevibes.dto.payment.PaymentWebhookRequest;
import com.devinevibes.dto.payment.SignedUrlResponse;

public interface PaymentService {
    PaymentResponse createPayment(CreatePaymentRequest request);
    PaymentResponse handleWebhook(PaymentWebhookRequest request);
    SignedUrlResponse generateSignedUploadUrl(String fileName);
}
