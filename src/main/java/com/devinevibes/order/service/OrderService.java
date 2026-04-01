package com.devinevibes.order.service;

import com.devinevibes.cart.repository.CartItemRepository;
import com.devinevibes.common.enums.OrderStatus;
import com.devinevibes.common.exception.ApiException;
import com.devinevibes.order.dto.OrderDtos;
import com.devinevibes.order.entity.Order;
import com.devinevibes.order.entity.OrderItem;
import com.devinevibes.order.repository.OrderRepository;
import com.devinevibes.user.entity.Address;
import com.devinevibes.user.entity.User;
import com.devinevibes.user.repository.AddressRepository;
import com.devinevibes.user.service.UserService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final UserService userService;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Order placeOrder(String principal, OrderDtos.PlaceOrderRequest request) {
        User user = userService.getCurrentUser(principal);
        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));
        var cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Order order = Order.builder().user(user).shippingAddress(address).status(OrderStatus.CREATED).totalAmount(BigDecimal.ZERO).build();
        BigDecimal total = BigDecimal.ZERO;
        for (var cart : cartItems) {
            var oi = OrderItem.builder().order(order).product(cart.getProduct())
                    .quantity(cart.getQuantity()).unitPrice(cart.getProduct().getPrice()).build();
            order.getItems().add(oi);
            total = total.add(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        }
        order.setTotalAmount(total);
        cartRepository.deleteByUser(user);
        return orderRepository.save(order);
    }

    public Page<Order> myOrders(String principal, int page, int size) {
        return orderRepository.findByUser(userService.getCurrentUser(principal), PageRequest.of(page, size));
    }

    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
