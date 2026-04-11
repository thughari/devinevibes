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

            boolean isDelivered = status == com.devinevibes.entity.order.OrderStatus.DELIVERED;
            String subject = isDelivered 
                ? "Your order has been delivered! — #" + order.getId()
                : "Your order is on its way! — #" + order.getId();
            helper.setSubject(subject);

            String headerTitle = isDelivered ? "Order Delivered" : "Order Shipped";
            String headerColor = isDelivered ? "#16a34a" : "#c59d5f";
            String headerIcon = isDelivered ? "✓" : "📦";
            String greeting = "Hi " + (order.getShippingFirstName() != null ? order.getShippingFirstName() : "there") + ",";
            String mainMessage = isDelivered 
                ? "Great news! Your order <strong>#" + order.getId() + "</strong> has been delivered successfully. We hope you love your items!"
                : "Your order <strong>#" + order.getId() + "</strong> has been shipped and is on its way to you. You can track it using the details below.";

            // Build items table
            StringBuilder itemsHtml = new StringBuilder();
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (com.devinevibes.entity.order.OrderItem item : order.getItems()) {
                    String priceDisplay = item.getUnitPrice().compareTo(java.math.BigDecimal.ZERO) == 0 ? "FREE" : "₹" + item.getUnitPrice();
                    itemsHtml.append("<tr>")
                        .append("<td style='padding: 12px 0; border-bottom: 1px solid #f1f5f9;'>")
                        .append("<div style='font-weight: 600; color: #0f172a; font-size: 14px;'>").append(item.getProduct().getName()).append("</div>")
                        .append("<div style='font-size: 12px; color: #94a3b8; margin-top: 2px;'>Qty: ").append(item.getQuantity()).append("</div>")
                        .append("</td>")
                        .append("<td style='padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a;'>").append(priceDisplay).append("</td>")
                        .append("</tr>");
                }
            }

            // Build cost breakdown
            StringBuilder costHtml = new StringBuilder();
            if (order.getSubtotalAmount() != null) {
                costHtml.append("<div style='display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px;'>")
                    .append("<span>Subtotal</span><span>₹").append(order.getSubtotalAmount()).append("</span></div>");
            }
            if (order.getShippingCost() != null && order.getShippingCost().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costHtml.append("<div style='display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px;'>")
                    .append("<span>Shipping</span><span>₹").append(order.getShippingCost()).append("</span></div>");
            }
            if (order.getCodFee() != null && order.getCodFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costHtml.append("<div style='display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px;'>")
                    .append("<span>COD Fee</span><span>₹").append(order.getCodFee()).append("</span></div>");
            }
            if (order.getCouponDiscount() != null && order.getCouponDiscount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                costHtml.append("<div style='display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; margin-bottom: 6px;'>")
                    .append("<span>Discount</span><span>-₹").append(order.getCouponDiscount()).append("</span></div>");
            }

            String paymentLabel = "COD".equalsIgnoreCase(order.getPaymentMethod()) ? "Cash on Delivery" : "Paid Online";
            String trackingIdDisplay = order.getTrackingId() != null && !order.getTrackingId().isBlank() ? order.getTrackingId() : "—";
            
            String ctaUrl = isDelivered ? uiUrl + "/products" : uiUrl + "/order/tracking/" + order.getId();
            String ctaText = isDelivered ? "Shop More" : "Track Your Order";

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
                    <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #000000; padding: 25px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 50px;">
                        </div>
                        
                        <div style="padding: 0; border-top: 4px solid %s;">
                            <!-- Status Banner -->
                            <div style="padding: 35px 20px 20px 20px; text-align: center;">
                                <div style="font-size: 42px; margin-bottom: 12px; color: %s;">%s</div>
                                <h1 style="color: #1e293b; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: -0.5px;">%s</h1>
                            </div>

                            <div style="padding: 35px 30px;">
                                <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-top: 0;">%s</p>
                                <p style="font-size: 15px; line-height: 1.7; color: #475569;">%s</p>

                                <!-- Order Info Bar -->
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 20px; margin: 25px 0;">
                                    <table style="width: 100%%; border-collapse: collapse;">
                                        <tr>
                                            <td style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; padding-bottom: 4px;">Order</td>
                                            <td style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; padding-bottom: 4px;">Payment</td>
                                            <td style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; padding-bottom: 4px;">AWB / Tracking</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size: 14px; font-weight: 600; color: #0f172a;">#%s</td>
                                            <td style="font-size: 14px; font-weight: 600; color: #0f172a;">%s</td>
                                            <td style="font-size: 14px; font-weight: 600; color: #0f172a; font-family: monospace;">%s</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Items -->
                                <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 10px; font-weight: 700;">Items in this order</h3>
                                <table style="width: 100%%; border-collapse: collapse; margin-bottom: 20px;">
                                    <tbody>
                                        %s
                                    </tbody>
                                </table>

                                <!-- Cost Summary -->
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                                    %s
                                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px;">
                                        <span>Total</span><span>₹%s</span>
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="%s" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">%s</a>
                                </div>
                            </div>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 25px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">Questions? Simply reply to this email and we'll help you out.</p>
                            <p style="margin-top: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Devine Vibes &bull; Premium Spiritual Collection</p>
                        </div>
                    </div>
                </div>
                """.formatted(
                    headerColor,
                    headerColor,
                    headerIcon,
                    headerTitle,
                    greeting,
                    mainMessage,
                    order.getId(),
                    paymentLabel,
                    trackingIdDisplay,
                    itemsHtml.toString(),
                    costHtml.toString(),
                    order.getTotalAmount().toString(),
                    ctaUrl,
                    ctaText
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
    public void sendRefundSettled(com.devinevibes.entity.order.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            helper.setSubject("Refund Successfully Processed — Order #" + order.getId());

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Georgia', serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 60px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #10b981;">
                            <h2 style="color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; text-align: center;">Payment Update</h2>
                            <h1 style="color: #0f172a; font-size: 28px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Refund Settled</h1>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #475569; text-align: center;">Great news! The refund for your order <strong>#%s</strong> has been successfully processed by the banks and should now be reflected in your account.</p>
                            
                            <div style="margin: 30px 0; padding: 25px; background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 4px; text-align: center;">
                                <div style="font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Refund Amount</div>
                                <div style="font-size: 32px; color: #166534; font-weight: bold;">₹%s</div>
                            </div>
                            
                            <p style="font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">We hope to see you again soon at Devine Vibes. Have a blessed day!</p>
                        </div>
                    </div>
                </div>
                """.formatted(order.getId(), order.getTotalAmount());

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send refund settled email", e);
        }
    }

    @Async("notificationExecutor")
    public void sendRefundFailed(com.devinevibes.entity.order.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(order.getShippingEmail());
            helper.setSubject("Important: Refund Issue — Order #" + order.getId());

            String htmlContent = """
                <div style="background-color: #fffafb; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fee2e2; border-radius: 4px; overflow: hidden;">
                        <div style="padding: 40px; border-top: 4px solid #ef4444;">
                            <h1 style="color: #b91c1c; font-size: 24px; margin-top: 0;">Problem with your Refund</h1>
                            <p style="font-size: 16px; line-height: 1.7;">Hi %s, we encountered an issue while processing the refund for order <strong>#%s</strong>.</p>
                            <p style="font-size: 16px; line-height: 1.7;">This can sometimes happen if the original payment source is no longer active. Don't worry, your money is safe.</p>
                            
                            <div style="margin: 25px 0; padding: 20px; background-color: #fef2f2; border-radius: 4px;">
                                <strong>What should I do?</strong><br>
                                Please reply to this email or contact our support team at <strong>support@devinevibes.in</strong> with your order ID and an alternative bank account for the refund.
                            </div>
                        </div>
                    </div>
                </div>
                """.formatted(order.getShippingFirstName(), order.getId());

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send refund failed email", e);
        }
    }

    @Async("notificationExecutor")
    public void sendPaymentFailed(String to, String orderId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new jakarta.mail.internet.InternetAddress(orderSenderEmail, fromName));
            helper.setTo(to);
            helper.setSubject("Your Devine Vibes Checkout Attempt");

            String htmlContent = """
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; padding: 25px; text-align: center;">
                            <img src="https://devinevibes.in/logo.jpeg" alt="Devine Vibes" style="height: 50px;">
                        </div>
                        <div style="padding: 40px; border-top: 4px solid #f59e0b;">
                             <h1 style="color: #0f172a; font-size: 24px; margin-top: 0;">Oops, something went wrong</h1>
                             <p style="font-size: 15px; line-height: 1.6; color: #475569;">It looks like your payment attempt for order <strong>#%s</strong> didn't go through. Don't worry, no money was charged.</p>
                             
                             <div style="text-align: center; margin: 35px 0;">
                                 <a href="%s/cart" style="display: inline-block; background-color: #c59d5f; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Finish Your Purchase</a>
                             </div>
                             
                             <p style="font-size: 14px; color: #64748b; text-align: center;">If you're having trouble, you can also select <strong>Cash on Delivery (COD)</strong> at checkout for a hassle-free experience.</p>
                        </div>
                    </div>
                </div>
                """.formatted(orderId, uiUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send payment failed email", e);
        }
    }

    @Async("notificationExecutor")
    public void send(String to, String subject, String body) {
        log.info("Simple EMAIL to={} subject={} body={}", to, subject, body);
    }
}

