package com.devinevibes.entity.cart;

import com.devinevibes.entity.product.Product;
import com.devinevibes.entity.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
public class CartItem {

    @Id
    private String id;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private Instant createdAt = Instant.now();
}
