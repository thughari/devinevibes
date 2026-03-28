package com.devinevibes.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public record GoogleLoginRequest(@NotBlank String idToken) {}
    public record SendOtpRequest(@NotBlank String phoneNumber) {}
    public record VerifyOtpRequest(@NotBlank String phoneNumber, @NotBlank String otp) {}
    public record EmailLoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record RefreshTokenRequest(@NotBlank String refreshToken) {}
    public record AuthResponse(String accessToken, String refreshToken, Long userId, String role) {}
}
