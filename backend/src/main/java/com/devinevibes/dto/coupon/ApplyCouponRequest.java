package com.devinevibes.dto.coupon;

import java.math.BigDecimal;

public record ApplyCouponRequest(String code, BigDecimal cartTotal, Integer quantity) {}
