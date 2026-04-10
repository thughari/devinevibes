package com.devinevibes.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddToCartRequest(@NotNull String productId, @NotNull @Min(1) Integer quantity) {}
