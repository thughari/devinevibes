package com.devinevibes.dto.product;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
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
        BigDecimal height
) implements Serializable {}
