package com.devinevibes.dto.payment;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(@NotNull Long orderId) {
}
