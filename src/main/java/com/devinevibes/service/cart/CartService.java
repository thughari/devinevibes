package com.devinevibes.service.cart;

import com.devinevibes.dto.cart.CartItemRequest;
import com.devinevibes.dto.cart.CartItemResponse;

import java.util.List;

public interface CartService {
    CartItemResponse addOrUpdate(Long userId, CartItemRequest request);
    void remove(Long userId, Long productId);
    List<CartItemResponse> getCart(Long userId);
}
