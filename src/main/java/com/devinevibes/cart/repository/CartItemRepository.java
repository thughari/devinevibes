package com.devinevibes.cart.repository;

import com.devinevibes.cart.entity.CartItem;
import com.devinevibes.product.entity.Product;
import com.devinevibes.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);
}
