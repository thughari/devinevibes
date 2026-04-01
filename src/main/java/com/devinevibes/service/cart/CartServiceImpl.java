package com.devinevibes.service.cart;

import com.devinevibes.dto.cart.CartItemRequest;
import com.devinevibes.dto.cart.CartItemResponse;
import com.devinevibes.entity.cart.CartItem;
import com.devinevibes.entity.product.Product;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.ResourceNotFoundException;
import com.devinevibes.repository.cart.CartItemRepository;
import com.devinevibes.repository.product.ProductRepository;
import com.devinevibes.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartItemResponse addOrUpdate(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.productId()).orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, request.productId())
                .orElse(CartItem.builder().user(user).product(product).quantity(0).build());
        item.setQuantity(request.quantity());
        return map(cartItemRepository.save(item));
    }

    @Override
    public void remove(Long userId, Long productId) {
        cartItemRepository.findByUserIdAndProductId(userId, productId).ifPresent(cartItemRepository::delete);
    }

    @Override
    public List<CartItemResponse> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId).stream().map(this::map).toList();
    }

    private CartItemResponse map(CartItem item) {
        return new CartItemResponse(item.getId(), item.getProduct().getId(), item.getProduct().getName(), item.getQuantity(), item.getProduct().getPrice(),
                item.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
    }
}
