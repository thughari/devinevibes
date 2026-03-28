package com.devinevibes.payment.entity;

import com.devinevibes.common.entity.BaseEntity;
import com.devinevibes.common.enums.PaymentStatus;
import com.devinevibes.order.entity.Order;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "payments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Order order;

    private String providerOrderId;
    private String providerPaymentId;
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
}
