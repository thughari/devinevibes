package com.devinevibes.order.controller;

import com.devinevibes.common.enums.OrderStatus;
import com.devinevibes.order.dto.OrderDtos;
import com.devinevibes.order.entity.Order;
import com.devinevibes.order.service.OrderService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public Order placeOrder(@Valid @RequestBody OrderDtos.PlaceOrderRequest request, Principal principal) {
        return orderService.placeOrder(principal.getName(), request);
    }

    @GetMapping
    public Page<Order> orders(@RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "10") int size,
                              Principal principal) {
        return orderService.myOrders(principal.getName(), page, size);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{orderId}/status")
    public Order updateStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        return orderService.updateStatus(orderId, status);
    }
}
