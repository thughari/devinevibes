package com.devinevibes.dto.marketing;

import java.time.Instant;

public record BannerRequest(
    String content,
    String type,
    String link,
    int priority,
    boolean active,
    boolean canDismiss,
    Instant expiryDate
) {}
