package com.devinevibes.repository.order;

import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.devinevibes.entity.order.OrderStatus;
import java.time.Instant;

public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {
    
    @EntityGraph(attributePaths = {"items", "user"})
    List<Order> findByUser(User user);

    @EntityGraph(attributePaths = {"items", "user"})
    Optional<Order> findById(UUID id);

    @EntityGraph(attributePaths = {"items", "user"})
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    List<Order> findByOrderStatusAndCreatedAtBefore(OrderStatus status, Instant before);
}
