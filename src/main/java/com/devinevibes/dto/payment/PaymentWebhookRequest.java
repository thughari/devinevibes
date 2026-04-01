package com.devinevibes.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentWebhookRequest(@NotBlank String providerPaymentId, @NotBlank String status) {
}
