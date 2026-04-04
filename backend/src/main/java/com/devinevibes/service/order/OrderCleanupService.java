package com.devinevibes.service.order;

import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.entity.order.PaymentStatus;
import com.devinevibes.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupService {

    private final OrderRepository orderRepository;

    /**
     * Runs every 5 minutes to cancel stale pending prepaid orders.
     * Stale is defined as PENDING for more than 20 minutes.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void cancelStaleOrders() {
        log.info("Starting scheduled cleanup of stale pending orders...");
        
        Instant threshold = Instant.now().minus(20, ChronoUnit.MINUTES);
        
        List<Order> staleOrders = orderRepository.findAll().stream()
            .filter(o -> o.getOrderStatus() == OrderStatus.PENDING)
            .filter(o -> "Prepaid".equalsIgnoreCase(o.getPaymentMethod()))
            .filter(o -> o.getPaymentStatus() == PaymentStatus.PENDING)
            .filter(o -> o.getCreatedAt().isBefore(threshold))
            .toList();

        if (!staleOrders.isEmpty()) {
            log.info("Found {} stale orders to cancel", staleOrders.size());
            for (Order order : staleOrders) {
                order.setOrderStatus(OrderStatus.CANCELLED);
                order.setCancellationReason("payment incomplete");
                log.info("Cancelled order {} due to incomplete payment after 20 minutes", order.getId());
            }
            orderRepository.saveAll(staleOrders);
        }
    }
}
