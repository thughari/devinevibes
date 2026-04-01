package com.devinevibes.service.payment;

import com.devinevibes.client.RazorpayClient;
import com.devinevibes.dto.payment.CreatePaymentOrderResponse;
import com.devinevibes.entity.order.Order;
import com.devinevibes.exception.OrderNotFoundException;
import com.devinevibes.repository.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;

    public PaymentService(OrderRepository orderRepository, RazorpayClient razorpayClient) {
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
    }

    @Transactional
    public CreatePaymentOrderResponse createRazorpayOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String razorOrderId = razorpayClient.createOrder(order.getId().toString(), amount);
        order.setRazorpayOrderId(razorOrderId);
        return new CreatePaymentOrderResponse(razorOrderId, "PENDING");
    }
}
