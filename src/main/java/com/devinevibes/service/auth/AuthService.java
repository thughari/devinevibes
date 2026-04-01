package com.devinevibes.service.auth;

import com.devinevibes.dto.auth.AuthResponse;
import com.devinevibes.dto.auth.GoogleLoginRequest;
import com.devinevibes.dto.auth.OtpRequest;
import com.devinevibes.dto.auth.OtpVerifyRequest;
import com.devinevibes.entity.user.AuthProvider;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.BadRequestException;
import com.devinevibes.repository.user.UserRepository;
import com.devinevibes.security.JwtUtils;
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

    @Value("${app.google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils, StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.redisTemplate = redisTemplate;
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
        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));
        String key = otpKey(request.phone());
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(5));
        log.info("OTP generated for {} (valid 5m)", request.phone());
    }

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String key = otpKey(request.phone());
        String cachedOtp = redisTemplate.opsForValue().get(key);
        if (cachedOtp == null || !cachedOtp.equals(request.otp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        redisTemplate.delete(key);

        User user = userRepository.findByPhone(request.phone()).orElseGet(() -> {
            User newUser = new User();
            newUser.setPhone(request.phone());
            newUser.setEmail(request.phone() + "@otp.local");
            newUser.setName("User" + request.phone().substring(Math.max(0, request.phone().length() - 4)));
            return userRepository.save(newUser);
        });

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

    private String otpKey(String phone) {
        return "otp:" + phone;
    }
}
