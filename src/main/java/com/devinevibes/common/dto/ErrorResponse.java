package com.devinevibes.common.dto;

import java.time.Instant;
import lombok.Builder;

@Builder
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
