package com.devinevibes.repository.order;

import com.devinevibes.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;


public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
}
