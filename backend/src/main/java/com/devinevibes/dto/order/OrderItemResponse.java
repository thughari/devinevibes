package com.devinevibes.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        String productId,
        String productName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal totalPrice,
        String imageUrl
) {}
