package com.devinevibes.entity.coupon;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
public class Coupon {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    private BigDecimal discountValue;
    private BigDecimal minimumCartValue;
    private Integer buyQty;
    private Integer getQty;
    private String productId;
    private boolean active = true;
    private Instant expiresAt;
    private Integer maxUses;
    private Integer maxUsesPerUser;
    private Integer usageCount = 0;
    private Instant createdAt = Instant.now();
}
