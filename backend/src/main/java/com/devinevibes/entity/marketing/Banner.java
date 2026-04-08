package com.devinevibes.entity.marketing;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "banners")
@Data
public class Banner implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String content;

    private String link;

    @Column(nullable = false)
    private String type; // INFO, SALE, ALERT

    private int priority = 0;

    private boolean active = true;

    private boolean canDismiss = true;

    private Instant expiryDate;

    private Instant createdAt = Instant.now();
}
