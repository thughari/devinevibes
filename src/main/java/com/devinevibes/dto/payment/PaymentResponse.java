package com.devinevibes.dto.payment;

public record PaymentResponse(String providerPaymentId, String status, String message) {
}
