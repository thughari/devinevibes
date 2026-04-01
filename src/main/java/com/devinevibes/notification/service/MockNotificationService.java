package com.devinevibes.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockNotificationService implements NotificationService {
    @Override
    public void sendSms(String phone, String message) {
        log.info("[MOCK SMS] to={} message={}", phone, message);
    }

    @Override
    public void sendEmail(String email, String subject, String body) {
        log.info("[MOCK EMAIL] to={} subject={} body={}", email, subject, body);
    }
}
