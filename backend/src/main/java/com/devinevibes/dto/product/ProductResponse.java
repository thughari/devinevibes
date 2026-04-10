package com.devinevibes.dto.product;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        String id,
        String productCode,
        String name,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer stock,
        String imageUrl,
        List<String> imageUrls,
        List<String> videoUrls,
        String categoryId,
        String categoryName,
        BigDecimal weight,
        BigDecimal length,
        BigDecimal breadth,
        BigDecimal height,
        java.time.Instant createdAt,
        Long salesCount
) implements Serializable {}
