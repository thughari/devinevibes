package com.devinevibes.service.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.ui.url}")
    private String uiUrl;

    @Value("${email.sender_email:noreply@devinevibes.in}") 
    private String fromEmail; 

    @Value("${email.sender_name:Devine Vibes}") 
    private String fromName; 

    @Async("notificationExecutor")
    public void sendLoginOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(fromEmail, fromName));
            helper.setTo(to);
            helper.setSubject("Your Devine Vibes Login OTP");

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0;">Welcome back to Devine Vibes</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #475569;">You're almost in. Please use the following One-Time Password (OTP) to securely log in to your account:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <div style="background-color: #f1f5f9; color: #0f172a; padding: 20px 32px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 6px; display: inline-block; border: 2px dashed #cbd5e1;">
                                %s
                            </div>
                        </div>
                        
                        <p style="font-size: 14px; text-align: center; color: #64748b;">This code will expire in 5 minutes.</p>
                        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                            If you didn't request this login, you can safely ignore this email.
                        </div>
                    </div>
                </div>
                """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP verification HTML email sent to: {}", to);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send OTP HTML email to {}", to, e);
        }
    }

    @Async("notificationExecutor")
    public void send(String to, String subject, String body) {
        log.info("Simple EMAIL to={} subject={} body={}", to, subject, body);
    }
}
