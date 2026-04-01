package com.devinevibes.controller.order;

import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.PlaceOrderRequest;
import com.devinevibes.security.AppUserPrincipal;
import com.devinevibes.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse place(@AuthenticationPrincipal AppUserPrincipal principal,
                               @Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(principal.getUserId(), request);
    }

    @GetMapping
    public List<OrderResponse> list(@AuthenticationPrincipal AppUserPrincipal principal) {
        return orderService.listMyOrders(principal.getUserId());
    }
}
