package com.devinevibes.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingNotificationService implements NotificationService {
    @Override
    public void sendOtp(String phone, String otp) {
        log.info("[MOCK-OTP] Sending OTP {} to {}", otp, phone);
    }
}
