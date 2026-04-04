package com.devinevibes.dto.coupon;

import java.math.BigDecimal;

public record ApplyCouponResponse(
    String code, 
    BigDecimal discountAmount, 
    BigDecimal finalTotal, 
    String message,
    String productIdToAdd,
    Integer quantityToAdd,
    Integer freeQuantity,
    String targetProductId
) {}
