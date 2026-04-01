package com.devinevibes.cart.service;

import com.devinevibes.cart.dto.CartDtos;
import com.devinevibes.cart.entity.CartItem;
import com.devinevibes.cart.repository.CartItemRepository;
import com.devinevibes.common.exception.ApiException;
import com.devinevibes.product.entity.Product;
import com.devinevibes.product.repository.ProductRepository;
import com.devinevibes.user.entity.User;
import com.devinevibes.user.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;
    private final UserService userService;

    public List<CartItem> list(String principal) {
        return cartRepo.findByUser(userService.getCurrentUser(principal));
    }

    public CartItem addOrUpdate(String principal, CartDtos.CartItemRequest request) {
        User user = userService.getCurrentUser(principal);
        Product product = productRepo.findById(request.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        CartItem item = cartRepo.findByUserAndProduct(user, product)
                .orElse(CartItem.builder().user(user).product(product).quantity(0).build());
        item.setQuantity(request.quantity());
        return cartRepo.save(item);
    }

    public void remove(String principal, Long itemId) {
        CartItem item = cartRepo.findById(itemId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (!item.getUser().getId().equals(userService.getCurrentUser(principal).getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot remove another user's cart item");
        }
        cartRepo.delete(item);
    }
}
