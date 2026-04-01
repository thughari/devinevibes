package com.devinevibes.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, String status, BigDecimal totalAmount, Instant createdAt, List<OrderItemDto> items) {
    public record OrderItemDto(Long productId, String productName, Integer quantity, BigDecimal price) {}
}
