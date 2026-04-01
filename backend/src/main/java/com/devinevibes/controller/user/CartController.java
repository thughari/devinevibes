package com.devinevibes.controller.user;

import com.devinevibes.dto.cart.AddToCartRequest;
import com.devinevibes.dto.cart.CartItemResponse;
import com.devinevibes.service.cart.CartService;
import com.devinevibes.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<Void> add(@Valid @RequestBody AddToCartRequest request) {
        cartService.add(SecurityUtils.currentPrincipalEmail(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> get() {
        return ResponseEntity.ok(cartService.get(SecurityUtils.currentPrincipalEmail()));
    }
}
