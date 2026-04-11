package com.devinevibes.repository.cart;

import com.devinevibes.entity.cart.CartItem;
import com.devinevibes.entity.product.Product;
import com.devinevibes.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface CartRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    Optional<CartItem> findByIdAndUser(String id, User user);
    void deleteByUser(User user);
    void deleteByProduct(Product product);
}
