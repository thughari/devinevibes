package com.devinevibes.dto.config;

import java.io.Serializable;
import java.math.BigDecimal;

public record StoreConfigResponse(
        BigDecimal freeShippingThreshold,
        BigDecimal standardShippingCost,
        BigDecimal codFee,
        Integer cancellationWindowHours
) implements Serializable {
}
