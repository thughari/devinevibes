package com.devinevibes.cart.controller;

import com.devinevibes.cart.dto.CartDtos;
import com.devinevibes.cart.entity.CartItem;
import com.devinevibes.cart.service.CartService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public List<CartItem> list(Principal principal) {
        return cartService.list(principal.getName());
    }

    @PostMapping("/items")
    public CartItem add(@Valid @RequestBody CartDtos.CartItemRequest request, Principal principal) {
        return cartService.addOrUpdate(principal.getName(), request);
    }

    @DeleteMapping("/items/{itemId}")
    public void remove(@PathVariable Long itemId, Principal principal) {
        cartService.remove(principal.getName(), itemId);
    }
}
