package com.devinevibes.dto.order;

import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.order.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        BigDecimal totalAmount,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        String razorpayOrderId,
        String trackingId,
        String paymentMethod,
        String customerName,
        String customerEmail,
        java.time.Instant createdAt,
        java.util.List<OrderItemResponse> items,
        String shippingAddress,
        String shippingCity,
        String shippingState,
        String shippingPostalCode,
        String shippingPhone,
        String shippingFirstName,
        String shippingLastName,
        BigDecimal subtotalAmount,
        BigDecimal shippingCost,
        BigDecimal codFee,
        BigDecimal couponDiscount
) {}
