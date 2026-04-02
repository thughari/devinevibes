package com.devinevibes.dto.cart;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(UUID cartItemId, UUID productId, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal totalPrice, String imageUrl) {}
