package com.devinevibes.order.dto;

import jakarta.validation.constraints.NotNull;

public class OrderDtos {
    public record PlaceOrderRequest(@NotNull Long addressId) {}
    public record UpdateOrderStatusRequest(@NotNull Long orderId, @NotNull String status) {}
}
