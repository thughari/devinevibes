package com.devinevibes.dto.order;

import jakarta.validation.constraints.NotBlank;
public record OrderRequest(
        @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String postalCode,
        String paymentMethod,
        String couponCode
) {}
