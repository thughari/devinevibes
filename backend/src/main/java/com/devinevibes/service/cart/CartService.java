package com.devinevibes.service.cart;

import com.devinevibes.dto.cart.AddToCartRequest;
import com.devinevibes.dto.cart.CartItemResponse;
import com.devinevibes.entity.cart.CartItem;
import com.devinevibes.entity.user.User;
import com.devinevibes.repository.cart.CartRepository;
import com.devinevibes.service.product.ProductService;
import com.devinevibes.service.user.UserService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserService userService;
    private final ProductService productService;

    public CartService(CartRepository cartRepository, UserService userService, ProductService productService) {
        this.cartRepository = cartRepository;
        this.userService = userService;
        this.productService = productService;
    }

    public void add(String email, AddToCartRequest request) {
        User user = userService.getByEmail(email);
        var product = productService.fetchEntity(request.productId());
        CartItem item = cartRepository.findByUserAndProduct(user, product).orElseGet(CartItem::new);
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity((item.getQuantity() == null ? 0 : item.getQuantity()) + request.quantity());
        cartRepository.save(item);
    }

    public List<CartItemResponse> get(String email) {
        User user = userService.getByEmail(email);
        return cartRepository.findByUser(user).stream().map(item -> {
            BigDecimal total = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return new CartItemResponse(item.getId(), item.getProduct().getId(), item.getProduct().getName(),
                    item.getQuantity(), item.getProduct().getPrice(), total, item.getProduct().getImageUrl());
        }).toList();
    }

    public void updateQuantity(String email, java.util.UUID cartItemId, Integer quantity) {
        User user = userService.getByEmail(email);
        CartItem item = cartRepository.findByIdAndUser(cartItemId, user)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        item.setQuantity(quantity);
        cartRepository.save(item);
    }

    public void remove(String email, java.util.UUID cartItemId) {
        User user = userService.getByEmail(email);
        CartItem item = cartRepository.findByIdAndUser(cartItemId, user)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        cartRepository.delete(item);
    }

    public List<CartItem> fetchItems(String email) {
        return cartRepository.findByUser(userService.getByEmail(email));
    }

    public void clear(String email) {
        cartRepository.deleteByUser(userService.getByEmail(email));
    }
}
