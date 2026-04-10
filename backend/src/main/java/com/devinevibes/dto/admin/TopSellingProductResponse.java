package com.devinevibes.dto.admin;

public record TopSellingProductResponse(
        String productId,
        String productName,
        String imageUrl,
        long totalQuantitySold,
        java.math.BigDecimal totalRevenueGenerated
) {}
