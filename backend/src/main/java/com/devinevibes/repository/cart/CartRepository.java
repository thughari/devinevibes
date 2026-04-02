package com.devinevibes.repository.cart;

import com.devinevibes.entity.cart.CartItem;
import com.devinevibes.entity.product.Product;
import com.devinevibes.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    Optional<CartItem> findByIdAndUser(UUID id, User user);
    void deleteByUser(User user);
}
