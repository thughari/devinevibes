package com.devinevibes.dto.coupon;

import com.devinevibes.entity.coupon.CouponType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CouponResponse(UUID id, String code, CouponType type, BigDecimal discountValue, BigDecimal minimumCartValue,
                             Integer buyQty, Integer getQty, UUID productId, boolean active, Instant expiresAt,
                             Integer maxUses, Integer maxUsesPerUser, Integer usageCount) {}
