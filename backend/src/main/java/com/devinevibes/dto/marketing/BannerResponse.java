package com.devinevibes.dto.marketing;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public record BannerResponse(
    UUID id,
    String content,
    String type,
    String link,
    int priority,
    boolean active,
    boolean canDismiss,
    Instant expiryDate,
    Instant createdAt
) implements Serializable {}
