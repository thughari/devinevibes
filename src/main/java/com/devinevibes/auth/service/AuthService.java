package com.devinevibes.auth.service;

import com.devinevibes.auth.dto.AuthDtos;
import com.devinevibes.common.enums.Role;
import com.devinevibes.common.exception.ApiException;
import com.devinevibes.notification.service.NotificationService;
import com.devinevibes.security.JwtService;
import com.devinevibes.user.entity.User;
import com.devinevibes.user.repository.UserRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final GoogleTokenVerifierService googleVerifier;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public void sendOtp(AuthDtos.SendOtpRequest request) {
        String otp = otpService.generateAndStoreOtp(request.phoneNumber());
        notificationService.sendSms(request.phoneNumber(), "Your OTP is " + otp + ". Valid for 5 minutes.");
    }

    public AuthDtos.AuthResponse verifyOtp(AuthDtos.VerifyOtpRequest request) {
        otpService.verifyOtp(request.phoneNumber(), request.otp());
        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseGet(() -> userRepository.save(User.builder()
                        .phoneNumber(request.phoneNumber())
                        .fullName("Mobile User")
                        .role(Role.ROLE_USER)
                        .enabled(true)
                        .build()));
        return issueTokens(user);
    }

    public AuthDtos.AuthResponse googleLogin(AuthDtos.GoogleLoginRequest request) {
        GoogleTokenVerifierService.GoogleProfile profile = googleVerifier.verify(request.idToken());
        User user = userRepository.findByEmail(profile.email())
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(profile.email())
                        .fullName(profile.name())
                        .profileUrl(profile.pictureUrl())
                        .googleId(profile.googleId())
                        .role(Role.ROLE_USER)
                        .enabled(true)
                        .build()));
        return issueTokens(user);
    }

    public AuthDtos.AuthResponse emailLogin(AuthDtos.EmailLoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return issueTokens(user);
    }

    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshTokenRequest request) {
        String subject = jwtService.extractSubject(request.refreshToken());
        if (!jwtService.isTokenValid(request.refreshToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        User user = userRepository.findByEmail(subject)
                .or(() -> userRepository.findByPhoneNumber(subject))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return issueTokens(user);
    }

    public User registerEmailUser(String email, String password, String fullName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        return userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .enabled(true)
                .role(Role.ROLE_USER)
                .build());
    }

    private AuthDtos.AuthResponse issueTokens(User user) {
        String subject = user.getEmail() != null ? user.getEmail() : user.getPhoneNumber();
        String accessToken = jwtService.generateAccessToken(subject, Map.of("role", user.getRole().name(), "uid", user.getId()));
        String refreshToken = jwtService.generateRefreshToken(subject);
        return new AuthDtos.AuthResponse(accessToken, refreshToken, user.getId(), user.getRole().name());
    }
}
