package com.devinevibes.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Async("notificationExecutor")
    public void send(String phone, String message) {
        log.info("SMS to={} message={}", phone, message);
    }
}
