package com.devinevibes.service.order;

import com.devinevibes.client.ShiprocketClient;
import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.dto.order.TrackingResponse;
import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderItem;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.order.PaymentStatus;
import com.devinevibes.exception.OrderNotFoundException;
import com.devinevibes.repository.order.OrderRepository;
import com.devinevibes.service.cart.CartService;
import com.devinevibes.service.user.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserService userService;
    private final ShiprocketClient shiprocketClient;

    public OrderService(OrderRepository orderRepository, CartService cartService, UserService userService, ShiprocketClient shiprocketClient) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.userService = userService;
        this.shiprocketClient = shiprocketClient;
    }

    @Transactional
    public OrderResponse createOrder(String email) {
        var cartItems = cartService.fetchItems(email);
        if (cartItems.isEmpty()) throw new IllegalArgumentException("Cart is empty");

        Order order = new Order();
        order.setUser(userService.getByEmail(email));

        BigDecimal total = BigDecimal.ZERO;
        for (var cart : cartItems) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(cart.getProduct());
            item.setQuantity(cart.getQuantity());
            item.setUnitPrice(cart.getProduct().getPrice());
            order.getItems().add(item);
            total = total.add(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        cartService.clear(email);
        return map(saved);
    }

    public List<OrderResponse> getMyOrders(String email) {
        return orderRepository.findByUser(userService.getByEmail(email)).stream().map(this::map).toList();
    }

    public TrackingResponse getTracking(String email, UUID orderId) {
        Order order = findOwnedOrder(email, orderId);
        return new TrackingResponse(order.getTrackingId(), order.getOrderStatus());
    }

    @Transactional
    public void markPaymentSuccess(String razorpayOrderId, String razorpayPaymentId) {
        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found for payment"));
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setOrderStatus(OrderStatus.PAYMENT_SUCCESS);
        order.setRazorpayPaymentId(razorpayPaymentId);

        var shipment = shiprocketClient.createShipment(order.getId().toString());
        order.setShipmentId(shipment.shipmentId());
        order.setTrackingId(shipment.trackingId());
        log.info("Shipment created for order {}", order.getId());
    }

    @Transactional
    public void updateLogisticsStatus(String trackingId, OrderStatus status) {
        Order order = orderRepository.findAll().stream()
                .filter(o -> trackingId.equals(o.getTrackingId()))
                .findFirst().orElseThrow(() -> new OrderNotFoundException("Tracking not found"));
        order.setOrderStatus(status);
    }

    public Order findOwnedOrder(String email, UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        if (!order.getUser().getEmail().equalsIgnoreCase(email)) throw new IllegalArgumentException("Access denied");
        return order;
    }

    private OrderResponse map(Order order) {
        return new OrderResponse(order.getId(), order.getTotalAmount(), order.getOrderStatus(),
                order.getPaymentStatus(), order.getRazorpayOrderId(), order.getTrackingId());
    }
}
