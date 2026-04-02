package com.devinevibes.controller.admin;

import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.repository.order.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderRepository orderRepository;

    public AdminOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> all() {
        return ResponseEntity.ok(orderRepository.findAll().stream()
                .map(o -> new OrderResponse(o.getId(), o.getTotalAmount(), o.getOrderStatus(), o.getPaymentStatus(), o.getRazorpayOrderId(), o.getTrackingId()))
                .toList());
    }
}
