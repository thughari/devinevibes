package com.devinevibes.dto.cart;

import java.math.BigDecimal;
public record CartItemResponse(
        String cartItemId,
        String productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        String imageUrl,
        Integer availableStock
) {}
