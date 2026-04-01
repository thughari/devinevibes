package com.devinevibes.auth.service;

import com.devinevibes.common.exception.ApiException;
import java.security.SecureRandom;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OtpService {
    private static final int MAX_ATTEMPTS = 3;
    private static final int OTP_TTL_MINUTES = 5;
    private static final int REQUEST_COOLDOWN_SECONDS = 60;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redis;

    public String generateAndStoreOtp(String phone) {
        String rateKey = "otp:rate:" + phone;
        if (Boolean.TRUE.equals(redis.hasKey(rateKey))) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "OTP already requested. Try again later");
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        redis.opsForValue().set("otp:" + phone, otp, Duration.ofMinutes(OTP_TTL_MINUTES));
        redis.opsForValue().set("otp:attempts:" + phone, "0", Duration.ofMinutes(OTP_TTL_MINUTES));
        redis.opsForValue().set(rateKey, "1", Duration.ofSeconds(REQUEST_COOLDOWN_SECONDS));
        return otp;
    }

    public void verifyOtp(String phone, String providedOtp) {
        String otpKey = "otp:" + phone;
        String attemptsKey = "otp:attempts:" + phone;

        String actualOtp = redis.opsForValue().get(otpKey);
        if (actualOtp == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP expired or not found");
        }

        String attemptsValue = redis.opsForValue().get(attemptsKey);
        int attempts = attemptsValue == null ? 0 : Integer.parseInt(attemptsValue);
        if (attempts >= MAX_ATTEMPTS) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Max OTP attempts exceeded");
        }

        if (!actualOtp.equals(providedOtp)) {
            redis.opsForValue().increment(attemptsKey);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        redis.delete(otpKey);
        redis.delete(attemptsKey);
    }
}
