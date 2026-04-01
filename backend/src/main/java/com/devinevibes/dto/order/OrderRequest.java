package com.devinevibes.dto.order;

import jakarta.validation.constraints.NotBlank;

public record OrderRequest(@NotBlank String shippingAddress) {}
