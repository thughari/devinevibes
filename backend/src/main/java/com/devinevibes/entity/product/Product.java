package com.devinevibes.entity.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {

    @Id
    private String id;

    @Column(unique = true)
    private String productCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private com.devinevibes.entity.category.Category category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal originalPrice;

    @Column(nullable = false)
    private Integer stock;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url")
    private java.util.Set<String> imageUrls = new java.util.LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_videos", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url")
    private java.util.Set<String> videoUrls = new java.util.LinkedHashSet<>();

    @Column(columnDefinition = "bigint default 0")
    private Long salesCount = 0L;

    private Instant createdAt = Instant.now();

    // Shipping Dimensions (in grams and cm)
    private java.math.BigDecimal weight;
    private java.math.BigDecimal length;
    private java.math.BigDecimal breadth;
    private java.math.BigDecimal height;
}
