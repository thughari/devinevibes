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

    @Value("${email.otp_sender:verification@devinevibes.in}") 
    private String otpSenderEmail; 

    @Value("${email.order_sender:notifications@devinevibes.in}") 
    private String orderSenderEmail; 

    @Value("${email.sender_name:Devine Vibes}") 
    private String fromName; 

    @Async("notificationExecutor")
    public void sendLoginOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(otpSenderEmail, fromName));
            helper.setTo(to);
            helper.setSubject("Your Devine Vibes Login OTP");

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Georgia', serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px; margin-bottom: 10px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #c59d5f;">
                            <h1 style="color: #0f172a; font-size: 24px; font-weight: normal; text-align: center; margin-top: 0;">Secure Sign-In</h1>
                            <p style="font-size: 16px; line-height: 1.8; color: #475569; text-align: center;">Welcome to the divine journey. Use the code below to access your account.</p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <div style="display: inline-block; background-color: #f1f5f9; color: #b45309; padding: 25px 40px; border-radius: 2px; font-weight: bold; font-size: 36px; letter-spacing: 8px; border: 1px solid #e2e8f0; font-family: 'Courier New', Courier, monospace;">
                                    %s
                                </div>
                            </div>
                            
                            <p style="font-size: 13px; text-align: center; color: #94a3b8; margin-top: 30px;">This code is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">
                            &copy; Devine Vibes &bull; High-Quality Spiritual Essentials
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
    public void sendOrderConfirmation(com.devinevibes.entity.order.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            helper.setSubject("Your Devine Vibes Order Confirmation — " + order.getId());

            StringBuilder itemsHtml = new StringBuilder();
            for (com.devinevibes.entity.order.OrderItem item : order.getItems()) {
                String priceDisplay = item.getUnitPrice().compareTo(java.math.BigDecimal.ZERO) == 0 ? "FREE" : "₹" + item.getUnitPrice();
                itemsHtml.append("<tr>")
                        .append("<td style='padding: 15px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;'>")
                            .append("<div style='font-weight: bold; color: #0f172a;'>").append(item.getProduct().getName()).append("</div>")
                            .append("<div style='font-size: 12px; color: #64748b; margin-top: 4px;'>Qty: ").append(item.getQuantity()).append("</div>")
                        .append("</td>")
                        .append("<td style='padding: 15px 0; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: top; color: #0f172a; font-weight: bold;'>").append(priceDisplay).append("</td>")
                        .append("</tr>");
            }

            // Cost Breakdown logic
            StringBuilder costBreakdown = new StringBuilder();
            if (order.getSubtotalAmount() != null) {
                costBreakdown.append("<div style='display: flex; justify-content: space-between; font-size: 14px; color: #64748b; margin-bottom: 5px;'>")
                             .append("<span>Subtotal</span><span>₹").append(order.getSubtotalAmount()).append("</span></div>");
            }
            if (order.getShippingCost() != null && order.getShippingCost().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costBreakdown.append("<div style='display: flex; justify-content: space-between; font-size: 14px; color: #64748b; margin-bottom: 5px;'>")
                             .append("<span>Shipping</span><span>₹").append(order.getShippingCost()).append("</span></div>");
            }
            if (order.getCodFee() != null && order.getCodFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costBreakdown.append("<div style='display: flex; justify-content: space-between; font-size: 14px; color: #64748b; margin-bottom: 5px;'>")
                             .append("<span>COD Fee</span><span>₹").append(order.getCodFee()).append("</span></div>");
            }
            if (order.getCouponDiscount() != null && order.getCouponDiscount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costBreakdown.append("<div style='display: flex; justify-content: space-between; font-size: 14px; color: #16a34a; margin-bottom: 5px;'>")
                             .append("<span>Coupon Discount</span><span>-₹").append(order.getCouponDiscount()).append("</span></div>");
            }

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
                    <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px;">
                        </div>
                        
                        <div style="padding: 40px; border-top: 4px solid #c59d5f;">
                            <h2 style="color: #b45309; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin-bottom: 10px; font-weight: 800;">Order Confirmed</h2>
                            <h1 style="color: #0f172a; font-size: 24px; margin-top: 0; margin-bottom: 25px; font-weight: normal;">Thank you for your purchase, %s.</h1>
                            
                            <p style="font-size: 15px; line-height: 1.6; color: #475569;">We've received your order and we're getting it ready to ship. We'll notify you the moment it's on its way.</p>
                            
                            <div style="margin: 40px 0; padding: 25px; background-color: #fcfcfc; border: 1px solid #f1f5f9; border-radius: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px;">
                                    <h3 style="margin: 0; font-size: 16px; color: #0f172a;">Summary — Order #%s</h3>
                                    <span style="font-size: 12px; color: #64748b;">%s</span>
                                </div>
                                <table style="width: 100%%; border-collapse: collapse; margin-bottom: 20px;">
                                    <tbody>
                                        %s
                                    </tbody>
                                </table>
                                
                                <div style="border-top: 1px solid #f1f5f9; pt: 20px; text-align: right;">
                                    %s
                                    <div style="font-size: 28px; color: #0f172a; font-weight: bold; margin-top: 10px;">Total: ₹%s</div>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Payment via %s</div>
                                </div>
                            </div>

                            <div style="text-align: center; margin-bottom: 40px;">
                                <a href="%s/order/history" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Manage Your Orders</a>
                            </div>
                            
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 4px;">
                                <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Shipping To</h4>
                                <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
                                    <strong>%s %s</strong><br>
                                    %s<br>
                                    %s, %s — %s
                                </p>
                            </div>
                        </div>
                        
                        <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">If you have any questions, reply to this email or visit our support page.</p>
                            <p style="margin-top: 15px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Devine Vibes &bull; Premium Spiritual Collection</p>
                        </div>
                    </div>
                </div>
                """.formatted(
                    order.getShippingFirstName(), 
                    order.getId(),
                    java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(java.time.ZoneId.of("Asia/Kolkata")).format(java.time.Instant.now()),
                    itemsHtml.toString(), 
                    costBreakdown.toString(),
                    order.getTotalAmount().toString(),
                    "COD".equalsIgnoreCase(order.getPaymentMethod()) ? "Cash on Delivery" : "Secure Online Payment",
                    uiUrl,
                    order.getShippingFirstName(), 
                    order.getShippingLastName() != null ? order.getShippingLastName() : "",
                    order.getShippingAddress(),
                    order.getShippingCity(),
                    order.getShippingState(),
                    order.getShippingPostalCode()
                );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", order.getShippingEmail());

        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {}", order.getShippingEmail(), e);
        }
    }
    @Async("notificationExecutor")
    public void sendOrderUpdate(com.devinevibes.entity.order.Order order, com.devinevibes.entity.order.OrderStatus status) {
        if (status != com.devinevibes.entity.order.OrderStatus.SHIPPED && status != com.devinevibes.entity.order.OrderStatus.DELIVERED) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            
            String title = status == com.devinevibes.entity.order.OrderStatus.SHIPPED ? "Divine Journey Started" : "Peace Delivered";
            String subTitle = status == com.devinevibes.entity.order.OrderStatus.SHIPPED ? "Your order is on its way" : "Your package has arrived";
            helper.setSubject(title + " — Devine Vibes");

            String trackingBlock = "";
            if (order.getTrackingId() != null && !order.getTrackingId().isBlank() && !order.getTrackingId().contains("PENDING")) {
                trackingBlock = """
                    <div style="margin: 30px 0; padding: 25px; background-color: #f1f5f9; border-radius: 4px; text-align: center;">
                        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 10px;">Tracking Identifier (AWB)</span>
                        <strong style="font-size: 20px; color: #0f172a; font-family: monospace;">%s</strong>
                    </div>
                """.formatted(order.getTrackingId());
            }

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Georgia', serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #c59d5f;">
                            <h2 style="color: #b45309; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; text-align: center;">%s</h2>
                            <h1 style="color: #0f172a; font-size: 28px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">%s</h1>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #475569; text-align: center;">Hi %s, your order #%s has reached a new milestone.</p>
                            
                            %s
                            
                            <div style="text-align: center; margin-top: 40px;">
                                <a href="https://devinevibes.in/order/tracking/%s" style="background-color: #0f172a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 2px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Track Your Journey</a>
                            </div>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Devine Vibes &bull; Quality Spiritually Inspired Goods</p>
                        </div>
                    </div>
                </div>
                """.formatted(
                    subTitle,
                    order.getShippingFirstName(), 
                    order.getId().substring(0, Math.min(order.getId().length(), 8)).toUpperCase(),
                    trackingBlock,
                    order.getId()
                );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Order update ({}) email sent to: {}", status, order.getShippingEmail());

        } catch (Exception e) {
            log.error("Failed to send order update email to {}", order.getShippingEmail(), e);
        }
    }

    @Async("notificationExecutor")
    public void sendRefundConfirmation(com.devinevibes.entity.order.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            helper.setSubject("Refund Processed — Devine Vibes Order #" + order.getId());

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Georgia', serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #ef4444;">
                            <h2 style="color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; text-align: center;">Transaction Update</h2>
                            <h1 style="color: #0f172a; font-size: 28px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Refund Initiated</h1>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #475569; text-align: center;">Hi %s, your refund for order #%s has been successfully initiated.</p>
                            
                            <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 4px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Refund Amount</div>
                                <div style="font-size: 32px; color: #0f172a; font-weight: bold;">₹%s</div>
                                <div style="font-size: 12px; color: #94a3b8; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Refund Identifier (Razorpay)</div>
                                <div style="font-size: 14px; color: #0f172a; font-family: monospace; margin-top: 5px;">%s</div>
                            </div>
                            
                            <p style="font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">The funds should settle into your original payment source within 5–7 business days, depending on your bank's processing time.</p>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Devine Vibes &bull; Quality Spiritually Inspired Goods</p>
                        </div>
                    </div>
                </div>
                """.formatted(
                    order.getShippingFirstName(),
                    order.getId(),
                    order.getTotalAmount().toString(),
                    order.getRefundId() != null ? order.getRefundId() : "N/A"
                );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Refund confirmation email sent to: {}", order.getShippingEmail());

        } catch (Exception e) {
            log.error("Failed to send refund email to {}", order.getShippingEmail(), e);
        }
    }

    @Async("notificationExecutor")
    public void sendCancellationEmail(com.devinevibes.entity.order.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            helper.setSubject("Order Cancelled — Devine Vibes #" + order.getId());

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Georgia', serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #ef4444;">
                            <h2 style="color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; text-align: center;">Update: Order Voided</h2>
                            <h1 style="color: #0f172a; font-size: 28px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Cancellation Confirmed</h1>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #475569; text-align: center;">Hi %s, your request to cancel order #%s has been successfully processed.</p>
                            
                            <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 4px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Items Cancelled</div>
                                <div style="font-size: 18px; color: #0f172a; font-weight: bold;">%d Item(s)</div>
                                <div style="font-size: 12px; color: #94a3b8; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Status</div>
                                <div style="font-size: 14px; color: #ef4444; font-weight: bold; text-transform: uppercase; margin-top: 5px;">Voided</div>
                            </div>
                            
                            <p style="font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">Since this was a %s order, no charges were captured or a refund is being processed back to your source if applicable.</p>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Devine Vibes &bull; Quality Spiritually Inspired Goods</p>
                        </div>
                    </div>
                </div>
                """.formatted(
                    order.getShippingFirstName(),
                    order.getId(),
                    order.getItems().size(),
                    order.getPaymentMethod()
                );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Cancellation email sent to: {}", order.getShippingEmail());

        } catch (Exception e) {
            log.error("Failed to send cancellation email to {}", order.getShippingEmail(), e);
        }
    }

    @Async("notificationExecutor")
    public void send(String to, String subject, String body) {
        log.info("Simple EMAIL to={} subject={} body={}", to, subject, body);
    }
}
