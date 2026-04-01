package com.devinevibes.dto.order;

import jakarta.validation.constraints.NotNull;

public record PlaceOrderRequest(@NotNull Long shippingAddressId) {
}
