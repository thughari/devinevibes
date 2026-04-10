package com.devinevibes.dto.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        BigDecimal originalPrice,
        @NotNull @Min(0) Integer stock,
        String imageUrl,
        List<String> imageUrls,
        List<String> videoUrls,
        String categoryId,
        java.math.BigDecimal weight,
        java.math.BigDecimal length,
        java.math.BigDecimal breadth,
        java.math.BigDecimal height
) {}
