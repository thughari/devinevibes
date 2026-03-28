package com.devinevibes.notification.service;

public interface NotificationService {
    void sendSms(String phone, String message);
    void sendEmail(String email, String subject, String body);
}
