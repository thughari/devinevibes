package com.devinevibes.service.notification;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        // Initialize Twilio SDK
        Twilio.init(accountSid, authToken);
    }

    @Async("notificationExecutor")
    public void sendOtp(String phone, String otp) {
        try {
            // Twilio requires E.164 format (+91 for India). 
            // If phone doesn't start with '+', we assume India (+91).
            String formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;

            String body = "Your Devine Vibes verification code is: " + otp + ". Valid for 5 minutes.";

            Message message = Message.creator(
                    new PhoneNumber(formattedPhone), // To
                    new PhoneNumber(fromNumber),      // From (Twilio Number)
                    body)                            // Content
                .create();

            log.info("Twilio SMS Sent to {}! SID: {}", formattedPhone, message.getSid());
        } catch (Exception e) {
            log.error("Twilio failed to send SMS to {}: {}", phone, e.getMessage());
        }
    }
}