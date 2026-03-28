package com.devinevibes.service.auth;

import com.devinevibes.dto.auth.*;
import com.devinevibes.dto.user.UserResponse;
import com.devinevibes.entity.user.AuthProvider;
import com.devinevibes.entity.user.User;
import com.devinevibes.entity.user.UserRole;
import com.devinevibes.exception.ApiException;
import com.devinevibes.repository.user.UserRepository;
import com.devinevibes.security.JwtService;
import com.devinevibes.service.notification.NotificationService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Override
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.idToken());
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        if (email == null || googleId == null) {
            throw new ApiException("Invalid Google token payload");
        }

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> {
                    existing.setGoogleId(googleId);
                    existing.setProvider(AuthProvider.GOOGLE);
                    return existing;
                })
                .orElse(User.builder()
                        .email(email)
                        .googleId(googleId)
                        .fullName(name != null ? name : "Google User")
                        .role(UserRole.CUSTOMER)
                        .provider(AuthProvider.GOOGLE)
                        .build());

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public void sendOtp(SendOtpRequest request) {
        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));
        redisTemplate.opsForValue().set("otp:" + request.phone(), otp, Duration.ofMinutes(5));
        notificationService.sendOtp(request.phone(), otp);
    }

    @Override
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String key = "otp:" + request.phone();
        String expected = Optional.ofNullable(redisTemplate.opsForValue().get(key)).map(Object::toString).orElse(null);
        if (expected == null || !expected.equals(request.otp())) {
            throw new ApiException("Invalid or expired OTP");
        }
        redisTemplate.delete(key);

        User user = userRepository.findByPhone(request.phone())
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone(request.phone())
                        .fullName("Mobile User")
                        .role(UserRole.CUSTOMER)
                        .provider(AuthProvider.OTP)
                        .build()));

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtService.isValidToken(request.refreshToken(), "refresh")) {
            throw new ApiException("Invalid refresh token");
        }
        Long userId = Long.valueOf(jwtService.parseClaims(request.refreshToken()).getSubject());
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String access = jwtService.generateAccessToken(String.valueOf(user.getId()), Map.of("role", user.getRole().name()));
        String refresh = jwtService.generateRefreshToken(String.valueOf(user.getId()));
        return new AuthResponse(access, refresh, new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole().name()));
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier.Builder builder = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance());
            if (!googleClientId.isBlank()) {
                builder.setAudience(java.util.List.of(googleClientId));
            }
            GoogleIdToken token = builder.build().verify(idToken);
            if (token == null) {
                throw new ApiException("Unable to verify Google token");
            }
            return token.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            throw new ApiException("Google token verification failed");
        }
    }
}
