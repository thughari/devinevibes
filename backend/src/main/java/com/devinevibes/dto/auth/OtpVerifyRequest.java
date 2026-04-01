package com.devinevibes.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record OtpVerifyRequest(@NotBlank String phone, @NotBlank String otp) {}
