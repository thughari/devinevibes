package com.devinevibes.service.auth;

import com.devinevibes.dto.auth.*;

public interface AuthService {
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
    void sendOtp(SendOtpRequest request);
    AuthResponse verifyOtp(VerifyOtpRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
}
