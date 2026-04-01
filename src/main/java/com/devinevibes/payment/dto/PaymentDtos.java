package com.devinevibes.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentDtos {
    public record CreatePaymentRequest(@NotNull Long orderId) {}
    public record PaymentWebhookRequest(@NotBlank String providerOrderId, @NotBlank String providerPaymentId,
                                        @NotBlank String signature, @NotBlank String event) {}
    public record SignedUploadUrlRequest(@NotBlank String filename, @NotBlank String contentType) {}
}
