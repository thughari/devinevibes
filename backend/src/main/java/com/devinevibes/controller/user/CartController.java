package com.devinevibes.controller.user;

import com.devinevibes.dto.cart.AddToCartRequest;
import com.devinevibes.dto.cart.CartItemResponse;
import com.devinevibes.service.cart.CartService;
import com.devinevibes.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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

    @PutMapping("/{cartItemId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable String cartItemId,
                                               @RequestParam @NotNull @Min(1) Integer quantity) {
        cartService.updateQuantity(SecurityUtils.currentPrincipalEmail(), cartItemId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> remove(@PathVariable String cartItemId) {
        cartService.remove(SecurityUtils.currentPrincipalEmail(), cartItemId);
        return ResponseEntity.noContent().build();
    }
}
