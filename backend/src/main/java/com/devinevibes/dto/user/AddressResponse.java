package com.devinevibes.dto.user;

import java.time.Instant;
import java.util.UUID;

public record AddressResponse(
        UUID id,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country,
        String label,
        boolean isDefault,
        Instant createdAt
) {}
