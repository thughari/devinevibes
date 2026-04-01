package com.devinevibes.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.1") BigDecimal price,
        @NotNull @Min(0) Integer stock,
        @NotBlank String category,
        String imageUrl,
        boolean active
) {
}
