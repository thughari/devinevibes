package com.devinevibes.dto.coupon;

import com.devinevibes.entity.coupon.CouponType;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateCouponRequest(
        String code,
        CouponType type,
        BigDecimal discountValue,
        BigDecimal minimumCartValue,
        Integer buyQty,
        Integer getQty,
        String productId,
        Boolean active,
        Instant expiresAt,
        Integer maxUses,
        Integer maxUsesPerUser
) {}
