package com.devinevibes.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CartDtos {
    public record CartItemRequest(@NotNull Long productId, @NotNull @Min(1) Integer quantity) {}
}
