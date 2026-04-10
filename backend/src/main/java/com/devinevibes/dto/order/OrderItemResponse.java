package com.devinevibes.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        String productId,
        String productName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal totalPrice,
        String imageUrl
) {}
