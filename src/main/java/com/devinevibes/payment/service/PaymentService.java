package com.devinevibes.payment.service;

import com.devinevibes.common.enums.OrderStatus;
import com.devinevibes.common.enums.PaymentStatus;
import com.devinevibes.common.exception.ApiException;
import com.devinevibes.order.repository.OrderRepository;
import com.devinevibes.payment.dto.PaymentDtos;
import com.devinevibes.payment.entity.Payment;
import com.devinevibes.payment.repository.PaymentRepository;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public Payment createPayment(PaymentDtos.CreatePaymentRequest request) {
        var order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        return paymentRepository.save(Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .providerOrderId("razorpay_order_" + UUID.randomUUID())
                .status(PaymentStatus.INITIATED)
                .build());
    }

    public Map<String, String> getSignedUploadUrl(PaymentDtos.SignedUploadUrlRequest request) {
        String key = UUID.randomUUID() + "-" + request.filename();
        return Map.of("url", "https://mock-bucket.example/upload/" + key + "?signature=mock-signature", "key", key);
    }

    public Payment handleWebhook(PaymentDtos.PaymentWebhookRequest request) {
        if (!"valid-signature".equals(request.signature())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature");
        }

        Payment payment = paymentRepository.findByProviderOrderId(request.providerOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if ("payment.captured".equals(request.event())) {
            payment.setProviderPaymentId(request.providerPaymentId());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.getOrder().setStatus(OrderStatus.PAID);
            orderRepository.save(payment.getOrder());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        return paymentRepository.save(payment);
    }
}
