package com.devinevibes.product.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductDtos {
    public record ProductRequest(@NotBlank String name, String description, @NotNull @Positive BigDecimal price,
                                 @NotNull @Min(0) Integer stock, String category, String imageUrl, boolean active) {}
    public record ProductResponse(Long id, String name, String description, BigDecimal price,
                                  Integer stock, String category, String imageUrl, boolean active) {}
}
