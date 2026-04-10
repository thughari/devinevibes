package com.devinevibes.service.auth;

import com.devinevibes.dto.auth.AuthResponse;
import com.devinevibes.dto.auth.GoogleLoginRequest;
import com.devinevibes.dto.auth.OtpRequest;
import com.devinevibes.dto.auth.OtpVerifyRequest;
import com.devinevibes.dto.auth.RefreshTokenRequest;
import com.devinevibes.entity.user.AuthProvider;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.BadRequestException;
import com.devinevibes.repository.user.UserRepository;
import com.devinevibes.security.JwtUtils;
import com.devinevibes.service.notification.SmsService;
import com.devinevibes.service.notification.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Collections;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final StringRedisTemplate redisTemplate;
    private final SmsService smsService;
    private final EmailService emailService;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils, StringRedisTemplate redisTemplate, SmsService smsService, EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.redisTemplate = redisTemplate;
        this.smsService=smsService;
        this.emailService = emailService;
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.idToken());
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = processGoogleUser(email, name, picture);
        return AuthResponse.of(
                jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name()),
                jwtUtils.generateRefreshToken(user.getEmail())
        );
    }

    public void sendOtp(OtpRequest request) {
        if ((request.phone() == null || request.phone().isBlank()) && (request.email() == null || request.email().isBlank())) {
            throw new BadRequestException("Phone or email is required");
        }

        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));
        String key = otpKey(request.phone(), request.email());
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(5));
        if (request.phone() != null && !request.phone().isBlank()) {
            smsService.sendOtp(request.phone(), otp);
            log.info("OTP generated for phone {} (valid 5m)", request.phone());
        } else {
            emailService.sendLoginOtp(request.email(), otp);
            log.info("OTP generated for email {} (valid 5m)", request.email());
        }
    }

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String key = otpKey(request.phone(), request.email());
        String cachedOtp = redisTemplate.opsForValue().get(key);
        if (cachedOtp == null || !cachedOtp.equals(request.otp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        redisTemplate.delete(key);

        User user = findUserByIdentifier(request.phone(), request.email()).orElseGet(() -> {
            User newUser = new User();
            if (request.phone() != null && !request.phone().isBlank()) {
                newUser.setPhone(request.phone());
            }
            if (request.email() != null && !request.email().isBlank()) {
                newUser.setEmail(request.email().toLowerCase());
            } else if (request.phone() != null) {
                newUser.setEmail(request.phone() + "@otp.local");
            }
            newUser.setName(normalizeName(request.name(), request.phone(), request.email()));
            newUser.setId(generateUserId());
            return userRepository.save(newUser);
        });
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if ((user.getEmail() == null || user.getEmail().endsWith("@otp.local")) && request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email().toLowerCase());
        }
        userRepository.save(user);

        return AuthResponse.of(
                jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name()),
                jwtUtils.generateRefreshToken(user.getEmail())
        );
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtUtils.validateRefreshToken(request.refreshToken())) {
            throw new BadRequestException("Invalid refresh token");
        }
        String email = jwtUtils.getEmailFromRefreshToken(request.refreshToken());
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadRequestException("User not found"));
        return AuthResponse.of(
                jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name()),
                jwtUtils.generateRefreshToken(user.getEmail())
        );
    }

    public User processGoogleUser(String email, String name, String imageUrl) {
        return userRepository.findByEmail(email.toLowerCase()).map(existing -> {
            existing.setName(name);
            if (imageUrl != null) existing.setProfileImageUrl(imageUrl);
            existing.setProvider(AuthProvider.GOOGLE);
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User user = new User();
            user.setEmail(email.toLowerCase());
            user.setName(name);
            user.setProfileImageUrl(imageUrl);
            user.setProvider(AuthProvider.GOOGLE);
            user.setId(generateUserId());
            return userRepository.save(user);
        });
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new BadRequestException("Invalid Google ID token");
            }
            return token.getPayload();
        } catch (Exception e) {
            throw new BadRequestException("Google token verification failed");
        }
    }

    private String otpKey(String phone, String email) {
        if (phone != null && !phone.isBlank()) return "otp:phone:" + phone;
        return "otp:email:" + email.toLowerCase();
    }

    private java.util.Optional<User> findUserByIdentifier(String phone, String email) {
        if (phone != null && !phone.isBlank()) {
            var byPhone = userRepository.findByPhone(phone);
            if (byPhone.isPresent()) return byPhone;
        }
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email.toLowerCase());
        }
        return java.util.Optional.empty();
    }

    private String normalizeName(String name, String phone, String email) {
        if (name != null && !name.isBlank()) return name.trim();
        if (email != null && !email.isBlank()) return email.split("@")[0];
        if (phone != null && phone.length() >= 4) return "User" + phone.substring(phone.length() - 4);
        return "User";
    }

    private String generateUserId() {
        String random = java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "U-" + random;
    }
}
