package com.devinevibes.service.order;

import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.PlaceOrderRequest;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);
    List<OrderResponse> listMyOrders(Long userId);
}
