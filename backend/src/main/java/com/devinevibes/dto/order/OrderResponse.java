package com.devinevibes.dto.order;

import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.order.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderResponse(UUID id, BigDecimal totalAmount, OrderStatus orderStatus, PaymentStatus paymentStatus, String razorpayOrderId, String trackingId) {}
