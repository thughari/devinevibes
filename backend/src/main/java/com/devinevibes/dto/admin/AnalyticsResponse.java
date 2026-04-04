package com.devinevibes.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsResponse(
        BigDecimal totalRevenue,
        BigDecimal prepaidRevenue,
        BigDecimal codRevenue,
        long totalOrders,
        long prepaidOrders,
        long codOrders,
        List<TopSellingProductResponse> topSellingProducts
) {}
