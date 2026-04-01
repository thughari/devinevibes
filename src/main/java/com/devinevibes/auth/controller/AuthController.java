package com.devinevibes.auth.controller;

import com.devinevibes.auth.dto.AuthDtos;
import com.devinevibes.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/google")
    public AuthDtos.AuthResponse google(@Valid @RequestBody AuthDtos.GoogleLoginRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/send-otp")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendOtp(@Valid @RequestBody AuthDtos.SendOtpRequest request) {
        authService.sendOtp(request);
    }

    @PostMapping("/verify-otp")
    public AuthDtos.AuthResponse verifyOtp(@Valid @RequestBody AuthDtos.VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/refresh")
    public AuthDtos.AuthResponse refresh(@Valid @RequestBody AuthDtos.RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse emailLogin(@Valid @RequestBody AuthDtos.EmailLoginRequest request) {
        return authService.emailLogin(request);
    }
}
