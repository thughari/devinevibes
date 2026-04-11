package com.devinevibes.service.order;

import com.devinevibes.dto.order.OrderRequest;
import com.devinevibes.dto.order.OrderResponse;
import com.devinevibes.client.ShiprocketClient;
import com.devinevibes.dto.order.TrackingResponse;
import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderItem;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.order.PaymentStatus;
import com.devinevibes.exception.OrderNotFoundException;
import com.devinevibes.repository.order.OrderRepository;
import com.devinevibes.service.cart.CartService;
import com.devinevibes.service.config.StoreConfigService;
import com.devinevibes.service.coupon.CouponService;
import com.devinevibes.service.notification.EmailService;
import com.devinevibes.service.product.ProductService;
import com.devinevibes.service.user.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devinevibes.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserService userService;
    private final ShiprocketClient shiprocketClient;
    private final ProductService productService;
    private final StoreConfigService storeConfigService;
    private final EmailService emailService;
    private final CouponService couponService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    
    @org.springframework.beans.factory.annotation.Value("${razorpay.key.id}")
    private String razorpayKey;
    
    @org.springframework.beans.factory.annotation.Value("${razorpay.key.secret}")
    private String razorpaySecret;

    public OrderService(OrderRepository orderRepository, CartService cartService, UserService userService, ShiprocketClient shiprocketClient, ProductService productService, StoreConfigService storeConfigService, com.devinevibes.service.notification.EmailService emailService, com.devinevibes.service.coupon.CouponService couponService, org.springframework.data.redis.core.StringRedisTemplate redisTemplate) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.userService = userService;
        this.shiprocketClient = shiprocketClient;
        this.productService = productService;
        this.storeConfigService = storeConfigService;
        this.emailService = emailService;
        this.couponService = couponService;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public OrderResponse createOrder(String email, OrderRequest request) {
        // Throttling: Prevent multiple PENDING orders from the same user in 60s
        Instant oneMinuteAgo = Instant.now().minus(60, ChronoUnit.SECONDS);
        List<Order> recentOrders = orderRepository.findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, Instant.now());
        boolean hasConflict = recentOrders.stream()
                .anyMatch(o -> o.getUser().getEmail().equalsIgnoreCase(email) && o.getCreatedAt().isAfter(oneMinuteAgo));

        if (hasConflict) {
            log.warn("Order creation throttled for user {}: recent attempt within 60s", email);
            throw new com.devinevibes.exception.BadRequestException("A recent checkout attempt is already in progress. Please wait 60 seconds.");
        }

        var cartItems = cartService.fetchItems(email);
        if (cartItems.isEmpty()) throw new IllegalArgumentException("Cart is empty");

        Order order = new Order();
        var user = userService.getByEmail(email);
        order.setUser(user);
        
        // AUTO-SAVE Phone to Profile if missing
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(request.phone());
            // Implicit save happens at end of transaction
            log.info("Auto-saved phone {} to user profile {}", request.phone(), email);
        }
        
        // Generate Order Number: DV-YYMMDD-XXXX
        String datePart = java.time.format.DateTimeFormatter.ofPattern("yyMMdd")
                .withZone(java.time.ZoneId.of("Asia/Kolkata"))
                .format(Instant.now());
        String redisKey = "order:counter:" + datePart;
        Long counter = redisTemplate.opsForValue().increment(redisKey);
        if (counter != null && counter == 1) {
            redisTemplate.expire(redisKey, java.time.Duration.ofDays(2));
        }
        String orderNumber = String.format("DV-%s-%04d", datePart, counter != null ? counter : 1);
        order.setId(orderNumber);
        
        // Save shipping context (Buyer vs Recipient logic)
        order.setShippingEmail(request.email());
        
        // Logic: Use recipient info if order is for someone else, otherwise buyer info
        String finalRecipientFirstName = request.firstName();
        String finalRecipientLastName = request.lastName();
        String finalRecipientPhone = request.phone();

        if (request.recipientName() != null && !request.recipientName().isBlank()) {
            String fullName = request.recipientName().trim();
            if (fullName.contains(" ")) {
                int lastSpace = fullName.lastIndexOf(" ");
                finalRecipientFirstName = fullName.substring(0, lastSpace);
                finalRecipientLastName = fullName.substring(lastSpace + 1);
            } else {
                finalRecipientFirstName = fullName;
                finalRecipientLastName = "";
            }
        }

        if (request.recipientPhone() != null && !request.recipientPhone().isBlank()) {
            finalRecipientPhone = request.recipientPhone();
        }

        order.setShippingFirstName(finalRecipientFirstName);
        order.setShippingLastName(finalRecipientLastName);
        order.setShippingPhone(finalRecipientPhone);
        
        order.setShippingAddress(request.address());
        order.setShippingCity(request.city());
        order.setShippingState(request.state());
        order.setShippingPostalCode(request.postalCode());
        order.setAlternatePhone(request.alternatePhone());
        order.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() : "Prepaid");

        int totalQty = 0;
        BigDecimal subtotal = BigDecimal.ZERO;
        for (var cart : cartItems) {
            if (cart.getQuantity() > cart.getProduct().getStock()) {
                throw new com.devinevibes.exception.BadRequestException("Not enough stock for product " + cart.getProduct().getName());
            }

            // Reserve stock now
            productService.reserveStock(cart.getProduct(), cart.getQuantity());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(cart.getProduct());
            item.setQuantity(cart.getQuantity());
            item.setUnitPrice(cart.getProduct().getPrice());
            order.getItems().add(item);
            
            totalQty += cart.getQuantity();
            subtotal = subtotal.add(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        }

        var config = storeConfigService.getConfig();
        BigDecimal shippingCost = subtotal.compareTo(config.freeShippingThreshold()) > 0 ? BigDecimal.ZERO : config.standardShippingCost();
        
        BigDecimal discount = BigDecimal.ZERO;
        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            try {
                com.devinevibes.dto.coupon.ApplyCouponResponse couponRes = couponService.apply(email, new com.devinevibes.dto.coupon.ApplyCouponRequest(request.couponCode(), subtotal, totalQty));
                discount = couponRes.discountAmount();
                order.setAppliedCoupon(request.couponCode());
                order.setCouponDiscount(discount);
                
                // Logic to separate Free items visually in order details
                if (couponRes.freeQuantity() != null && couponRes.freeQuantity() > 0 && couponRes.targetProductId() != null) {
                    UUID targetId = UUID.fromString(couponRes.targetProductId());
                    OrderItem paidItem = order.getItems().stream()
                        .filter(i -> i.getProduct().getId().equals(targetId))
                        .findFirst().orElse(null);
                        
                    if (paidItem != null) {
                        int originalQty = paidItem.getQuantity();
                        int freeQty = Math.min(originalQty, couponRes.freeQuantity());
                        
                        // Shrink the paid item
                        paidItem.setQuantity(originalQty - freeQty);
                        
                        // Add the FREE item row
                        OrderItem freeItem = new OrderItem();
                        freeItem.setOrder(order);
                        freeItem.setProduct(paidItem.getProduct());
                        freeItem.setQuantity(freeQty);
                        freeItem.setUnitPrice(BigDecimal.ZERO);
                        order.getItems().add(freeItem);
                        
                        // Clean up if the entire line was free (rare for BXGX but safe)
                        if (paidItem.getQuantity() == 0) {
                            order.getItems().remove(paidItem);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to apply coupon securely during checkout: {}", e.getMessage());
                throw new com.devinevibes.exception.BadRequestException("Failed to apply coupon: " + e.getMessage());
            }
        }
        
        BigDecimal total = subtotal.add(shippingCost).subtract(discount);
        
        // Add COD Fee if applicable
        BigDecimal codFee = BigDecimal.ZERO;
        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            codFee = config.codFee() != null ? config.codFee() : BigDecimal.ZERO;
            total = total.add(codFee);
        }
        
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        order.setTotalAmount(total);
        
        // Persist cost breakdown for emails and tracking
        order.setSubtotalAmount(subtotal);
        order.setShippingCost(shippingCost);
        order.setCodFee(codFee);
        
        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setOrderStatus(OrderStatus.PAYMENT_SUCCESS);
        }
        
        // SAVE FIRST to generate UUID
        Order saved = orderRepository.save(order);

        if ("COD".equalsIgnoreCase(saved.getPaymentMethod())) {
            var shipment = shiprocketClient.createShipment(saved);
            saved.setShiprocketOrderId(shipment.shiprocketOrderId());
            saved.setShipmentId(shipment.shipmentId());
            saved.setTrackingId(shipment.trackingId());
            saved = orderRepository.save(saved);
            
            emailService.sendOrderConfirmation(saved);
            
            // Increment sales count for COD
            for (OrderItem item : saved.getItems()) {
                productService.incrementSalesCount(item.getProduct(), item.getQuantity());
            }
        }
        
        if (saved.getAppliedCoupon() != null) {
            couponService.incrementUsage(saved.getAppliedCoupon());
        }
        
        // ONLY clear cart immediately for COD. 
        // Prepaid orders keep items in cart until payment is verified (in markPaymentSuccess).
        if ("COD".equalsIgnoreCase(saved.getPaymentMethod())) {
            cartService.clear(email);
        }

        // Auto-save address if new
        userService.autoSaveAddress(order.getUser(), request);
        
        return map(saved);
    }

    public List<OrderResponse> getMyOrders(String email) {
        return orderRepository.findByUser(userService.getByEmail(email)).stream()
                .sorted(java.util.Comparator.comparing(Order::getCreatedAt).reversed())
                .map(this::map).toList();
    }

    public PageResponse<OrderResponse> getAllOrders(Pageable pageable, String search, OrderStatus status) {
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null) {
                predicates.add(cb.equal(root.get("orderStatus"), status));
            }
            
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("shippingFirstName")), pattern),
                    cb.like(cb.lower(root.get("shippingLastName")), pattern),
                    cb.like(cb.lower(root.get("shippingEmail")), pattern),
                    cb.like(cb.lower(root.get("shippingPhone")), pattern),
                    cb.like(cb.lower(root.get("user").get("name")), pattern),
                    cb.like(cb.lower(root.get("user").get("email")), pattern)
                ));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        var page = orderRepository.findAll(spec, pageable);
        return PageResponse.from(page, page.getContent().stream().map(this::map).toList());
    }

    public OrderResponse getMyOrderById(String email, String orderId) {
        return map(findOwnedOrder(email, orderId));
    }

    public TrackingResponse getTracking(String email, String orderId) {
        Order order = findOwnedOrder(email, orderId);
        return new TrackingResponse(order.getTrackingId(), order.getOrderStatus());
    }

    public com.devinevibes.dto.order.LiveTrackingResponse getLiveTracking(String email, String orderId) {
        Order order = findOwnedOrder(email, orderId);
        if (order.getTrackingId() == null || order.getTrackingId().isBlank() || order.getTrackingId().contains("PENDING")) {
            return new com.devinevibes.dto.order.LiveTrackingResponse(null, null, null, java.util.Collections.emptyList());
        }
        return shiprocketClient.trackShipment(order.getTrackingId());
    }

    @Transactional
    public void markPaymentSuccess(String razorpayOrderId, String razorpayPaymentId) {
        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found for payment"));
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setOrderStatus(OrderStatus.PAYMENT_SUCCESS);
        order.setRazorpayPaymentId(razorpayPaymentId);

        var shipment = shiprocketClient.createShipment(order);
        order.setShiprocketOrderId(shipment.shiprocketOrderId());
        order.setShipmentId(shipment.shipmentId());
        order.setTrackingId(shipment.trackingId());
        log.info("Shipment created for order {} with SR-ID {}", order.getId(), order.getShiprocketOrderId());

        // Send confirmation email
        emailService.sendOrderConfirmation(order);
        
        // Increment sales count for Prepaid success
        for (OrderItem item : order.getItems()) {
            productService.incrementSalesCount(item.getProduct(), item.getQuantity());
        }
        
        // CLEAR CART ONLY NOW for prepaid success
        if (order.getUser() != null) {
            cartService.clear(order.getUser().getEmail());
        }
    }
    
    @Transactional
    public void cancelOrder(String email, String orderId) {
        Order order = findOwnedOrder(email, orderId);
        
        // RESTRICTED CANCELLATION: Check config window
        var config = storeConfigService.getConfig();
        int windowHours = config.cancellationWindowHours() != null ? config.cancellationWindowHours() : 2;
        Instant cutoff = order.getCreatedAt().plus(windowHours, ChronoUnit.HOURS);
        if (Instant.now().isAfter(cutoff) && order.getOrderStatus() != OrderStatus.PENDING) {
             throw new com.devinevibes.exception.BadRequestException("Cancellation window of " + windowHours + " hours has passed.");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            productService.releaseStock(item.getProduct(), item.getQuantity());
            log.info("Stock restored: {} x {} for order {}", item.getQuantity(), item.getProduct().getName(), orderId);
        }
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancellationReason("Request by customer");

        // Sync with Shiprocket if it was created
        if (order.getShiprocketOrderId() != null) {
            shiprocketClient.cancelOrder(order.getShiprocketOrderId());
        }

        // If it was already paid, initiate refund
        if (order.getPaymentStatus() == PaymentStatus.SUCCESS && "Prepaid".equalsIgnoreCase(order.getPaymentMethod())) {
            this.initiateRefund(order);
        } else {
            // Standard cancellation email for COD or unpaid orders
            emailService.sendCancellationEmail(order);
        }
        
        // Mark payment as failed AFTER the check
        order.setPaymentStatus(PaymentStatus.FAILED);
        
        orderRepository.save(order);
        log.info("Order {} cancelled and stock restored by user {}", orderId, email);
    }

    private void initiateRefund(Order order) {
        try {
            com.razorpay.RazorpayClient client = new com.razorpay.RazorpayClient(razorpayKey, razorpaySecret);
            com.razorpay.Refund refund = client.payments.refund(order.getRazorpayPaymentId());
            order.setRefundId(refund.get("id"));
            order.setRefundStatus(refund.get("status"));
            order.setRefundedAt(Instant.now());
            order.setOrderStatus(OrderStatus.REFUND_INITIATED);
            log.info("Refund initiated for order {}: refund_id={}", order.getId(), order.getRefundId());
            
            // Send Refund Confirmation Email
            emailService.sendRefundConfirmation(order);
        } catch (Exception e) {
            log.error("Failed to initiate automated refund for order {}: {}", order.getId(), e.getMessage());
        }
    }

    @Transactional
    public void updateLogisticsStatus(String trackingId, OrderStatus newStatus, String courierName) {
        Order order = orderRepository.findByTrackingId(trackingId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found with AWB: " + trackingId));

        order.setOrderStatus(newStatus);
        if (courierName != null && !courierName.isBlank()) {
            order.setCourierName(courierName);
        }
        orderRepository.save(order);

        // Optional: trigger email updates
        emailService.sendOrderUpdate(order, newStatus);
    }

    public Order findOwnedOrder(String email, String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        if (!order.getUser().getEmail().equalsIgnoreCase(email)) throw new IllegalArgumentException("Access denied");
        return order;
    }

    private OrderResponse map(Order order) {
        String cName = order.getUser() != null ? order.getUser().getName() : null;
        String cEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        
        var mappedItems = order.getItems().stream().map(item -> new com.devinevibes.dto.order.OrderItemResponse(
            item.getProduct().getId(),
            item.getProduct().getName(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
            item.getProduct().getImageUrl()
        )).toList();

        return new OrderResponse(
                order.getId(), order.getId(), order.getTotalAmount(), order.getOrderStatus(),
                order.getPaymentStatus(), order.getRazorpayOrderId(), order.getTrackingId(),
                order.getCourierName(), order.getPaymentMethod(), cName, cEmail, order.getCreatedAt(), mappedItems,
                order.getShippingAddress(), order.getShippingCity(), order.getShippingState(),
                order.getShippingPostalCode(), order.getShippingPhone(), 
                order.getShippingFirstName(), order.getShippingLastName(),
                order.getSubtotalAmount(), order.getShippingCost(), order.getCodFee(), order.getCouponDiscount()
        );
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void autoCancelAbandonedOrders() {
        var config = storeConfigService.getConfig();
        int hours = config.cancellationWindowHours() != null ? config.cancellationWindowHours() : 2;
        Instant cutoff = Instant.now().minus(hours, ChronoUnit.HOURS);
        List<Order> abandoned = orderRepository.findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);
        if (abandoned.isEmpty()) return;
        log.info("Watchdog: Found {} abandoned orders", abandoned.size());
        for (Order order : abandoned) {
            try {
                for (OrderItem item : order.getItems()) {
                    productService.releaseStock(item.getProduct(), item.getQuantity());
                }
                order.setOrderStatus(OrderStatus.CANCELLED);
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setCancellationReason("System: Abandoned payment");
                orderRepository.save(order);
                log.info("Auto-cancelled abandoned order {}", order.getId());
            } catch (Exception e) {
                log.error("Failed to auto-cancel order {}: {}", order.getId(), e.getMessage());
            }
        }
    }
}
