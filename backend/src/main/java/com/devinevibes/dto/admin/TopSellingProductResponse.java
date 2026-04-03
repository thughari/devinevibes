package com.devinevibes.dto.admin;

public record TopSellingProductResponse(
        java.util.UUID productId,
        String productName,
        String imageUrl,
        long totalQuantitySold,
        java.math.BigDecimal totalRevenueGenerated
) {}
