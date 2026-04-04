package com.devinevibes.dto.config;

import java.math.BigDecimal;

public record StoreConfigResponse(
        BigDecimal freeShippingThreshold,
        BigDecimal standardShippingCost,
        BigDecimal codFee
) {
}
