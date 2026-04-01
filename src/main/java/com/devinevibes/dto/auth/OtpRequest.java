package com.devinevibes.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record OtpRequest(@NotBlank String phone) {}
