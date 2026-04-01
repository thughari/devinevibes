package com.devinevibes.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Async("notificationExecutor")
    public void send(String to, String subject, String body) {
        log.info("EMAIL to={} subject={} body={}", to, subject, body);
    }
}
