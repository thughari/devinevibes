package com.devinevibes.controller.cart;

import com.devinevibes.dto.cart.CartItemRequest;
import com.devinevibes.dto.cart.CartItemResponse;
import com.devinevibes.security.AppUserPrincipal;
import com.devinevibes.service.cart.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public CartItemResponse add(@AuthenticationPrincipal AppUserPrincipal principal,
                                @Valid @RequestBody CartItemRequest request) {
        return cartService.addOrUpdate(principal.getUserId(), request);
    }

    @DeleteMapping("/{productId}")
    public void remove(@AuthenticationPrincipal AppUserPrincipal principal, @PathVariable Long productId) {
        cartService.remove(principal.getUserId(), productId);
    }

    @GetMapping
    public List<CartItemResponse> get(@AuthenticationPrincipal AppUserPrincipal principal) {
        return cartService.getCart(principal.getUserId());
    }
}
