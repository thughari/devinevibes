package com.devinevibes.entity.order;

import com.devinevibes.entity.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    private String id;

    @ManyToOne(optional = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "TEXT")
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "TEXT")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    private String shiprocketOrderId;
    private String shipmentId;
    private String trackingId;
    private String courierName;
    private String refundId;
    private String refundStatus;
    private Instant refundedAt;

    private String paymentMethod;
    private String appliedCoupon;
    private BigDecimal couponDiscount = BigDecimal.ZERO;

    // Shipping Address Snapshot
    private String shippingFirstName;
    private String shippingLastName;
    private String shippingEmail;
    private String shippingPhone;
    private String alternatePhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingPostalCode;

    private String cancellationReason;
    
    // Cost Breakdown Persistence
    private BigDecimal subtotalAmount;
    private BigDecimal shippingCost;
    private BigDecimal codFee;

    private Instant createdAt = Instant.now();
}
