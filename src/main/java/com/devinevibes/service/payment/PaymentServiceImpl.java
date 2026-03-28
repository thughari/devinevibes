package com.devinevibes.service.payment;

import com.devinevibes.dto.payment.CreatePaymentRequest;
import com.devinevibes.dto.payment.PaymentResponse;
import com.devinevibes.dto.payment.PaymentWebhookRequest;
import com.devinevibes.dto.payment.SignedUrlResponse;
import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.payment.Payment;
import com.devinevibes.entity.payment.PaymentStatus;
import com.devinevibes.exception.ResourceNotFoundException;
import com.devinevibes.repository.order.OrderRepository;
import com.devinevibes.repository.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.orderId()).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .providerPaymentId("razorpay_" + UUID.randomUUID())
                .status(PaymentStatus.CREATED)
                .build();
        Payment saved = paymentRepository.save(payment);
        return new PaymentResponse(saved.getProviderPaymentId(), saved.getStatus().name(), "Payment created (simulated)");
    }

    @Override
    @Transactional
    public PaymentResponse handleWebhook(PaymentWebhookRequest request) {
        Payment payment = paymentRepository.findByProviderPaymentId(request.providerPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        boolean success = "SUCCESS".equalsIgnoreCase(request.status());
        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.getOrder().setStatus(success ? OrderStatus.SUCCESS : OrderStatus.FAILED);

        return new PaymentResponse(payment.getProviderPaymentId(), payment.getStatus().name(), "Webhook processed");
    }

    @Override
    public SignedUrlResponse generateSignedUploadUrl(String fileName) {
        String key = "uploads/" + UUID.randomUUID() + "-" + fileName;
        return new SignedUrlResponse("https://mock-storage.dev/upload/" + key + "?signature=mock-signature", key, 600);
    }
}
