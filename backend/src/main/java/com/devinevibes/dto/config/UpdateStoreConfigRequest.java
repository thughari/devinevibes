package com.devinevibes.dto.config;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record UpdateStoreConfigRequest(
        @NotNull @PositiveOrZero BigDecimal freeShippingThreshold,
        @NotNull @PositiveOrZero BigDecimal standardShippingCost,
        @NotNull @PositiveOrZero BigDecimal codFee
) {
}
