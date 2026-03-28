package com.devinevibes.service.order;

import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.PlaceOrderRequest;
import com.devinevibes.entity.cart.CartItem;
import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderItem;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.user.Address;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.ApiException;
import com.devinevibes.exception.ResourceNotFoundException;
import com.devinevibes.repository.cart.CartItemRepository;
import com.devinevibes.repository.order.OrderRepository;
import com.devinevibes.repository.user.AddressRepository;
import com.devinevibes.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Address address = addressRepository.findById(request.shippingAddressId()).orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        List<CartItem> items = cartItemRepository.findByUserId(userId);
        if (items.isEmpty()) {
            throw new ApiException("Cart is empty");
        }

        BigDecimal total = items.stream().map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .shippingAddress(address)
                .status(OrderStatus.PENDING)
                .totalAmount(total)
                .build();

        List<OrderItem> orderItems = items.stream().map(ci -> OrderItem.builder()
                .order(order)
                .product(ci.getProduct())
                .quantity(ci.getQuantity())
                .price(ci.getProduct().getPrice())
                .build()).toList();

        order.setItems(orderItems);
        Order saved = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);
        return map(saved);
    }

    @Override
    public List<OrderResponse> listMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::map).toList();
    }

    private OrderResponse map(Order o) {
        return new OrderResponse(o.getId(), o.getStatus().name(), o.getTotalAmount(), o.getCreatedAt(),
                o.getItems().stream().map(oi -> new OrderResponse.OrderItemDto(oi.getProduct().getId(), oi.getProduct().getName(), oi.getQuantity(), oi.getPrice())).toList());
    }
}
