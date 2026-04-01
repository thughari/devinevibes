package com.devinevibes.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(
        @NotBlank @Pattern(regexp = "^[0-9]{10,15}$") String phone,
        @NotBlank @Pattern(regexp = "^[0-9]{6}$") String otp
) {
}
