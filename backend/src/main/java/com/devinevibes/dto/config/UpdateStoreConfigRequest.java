package com.devinevibes.dto.config;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record UpdateStoreConfigRequest(
        @NotNull @PositiveOrZero BigDecimal freeShippingThreshold,
        @NotNull @DecimalMin("0.0") BigDecimal standardShippingCost,
        @DecimalMin("0.0") BigDecimal codFee,
        @NotNull @Min(1) Integer cancellationWindowHours
) {
}
