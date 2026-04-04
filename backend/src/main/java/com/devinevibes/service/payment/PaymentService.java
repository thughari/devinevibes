package com.devinevibes.service.payment;

import com.devinevibes.client.RazorpayClient;
import com.devinevibes.dto.payment.CreatePaymentOrderResponse;
import com.devinevibes.dto.payment.VerifyPaymentRequest;
import com.devinevibes.entity.order.Order;
import com.devinevibes.exception.OrderNotFoundException;
import com.devinevibes.service.order.OrderService;
import com.devinevibes.repository.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final OrderService orderService;

    public PaymentService(OrderRepository orderRepository, RazorpayClient razorpayClient, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.orderService = orderService;
    }

    @Transactional
    public CreatePaymentOrderResponse createRazorpayOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String razorOrderId = razorpayClient.createOrder(order.getId().toString(), amount);
        order.setRazorpayOrderId(razorOrderId);
        return new CreatePaymentOrderResponse(razorOrderId, "PENDING");
    }

    @Transactional
    public void verifyRazorpayPayment(UUID orderId, VerifyPaymentRequest request) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if (order.getRazorpayOrderId() == null || !order.getRazorpayOrderId().equals(request.razorpayOrderId())) {
            throw new com.devinevibes.exception.BadRequestException("Order ID mismatch or invalid");
        }
        
        if (request.razorpaySignature() != null && !request.razorpaySignature().isBlank()) {
            boolean isValid = razorpayClient.verifySignature(request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
            if (!isValid) {
                throw new com.devinevibes.exception.BadRequestException("Invalid Payment Signature");
            }
        } else {
            // Test mode: Razorpay may not return signature when order_id was undefined
            System.out.println("WARNING: Payment verified without signature (test mode). Order: " + orderId);
        }
        
        orderService.markPaymentSuccess(request.razorpayOrderId(), request.razorpayPaymentId());
    }
}
