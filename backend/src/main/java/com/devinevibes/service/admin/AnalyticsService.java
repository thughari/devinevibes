package com.devinevibes.service.admin;

import com.devinevibes.dto.admin.AnalyticsResponse;
import com.devinevibes.dto.admin.TopSellingProductResponse;
import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderStatus;
import com.devinevibes.repository.order.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {
    
    private final OrderRepository orderRepository;

    public AnalyticsService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public AnalyticsResponse getAnalytics() {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .filter(o -> com.devinevibes.entity.order.PaymentStatus.SUCCESS.equals(o.getPaymentStatus()) 
                          || "COD".equalsIgnoreCase(o.getPaymentMethod()))
                .toList();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal prepaidRevenue = BigDecimal.ZERO;
        BigDecimal codRevenue = BigDecimal.ZERO;
        long totalOrders = orders.size();
        long prepaidOrders = 0;
        long codOrders = 0;

        Map<String, TopSellingProductResponse> productStatsMap = new HashMap<>();

        for (Order order : orders) {
            BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            totalRevenue = totalRevenue.add(amount);

            if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
                codOrders++;
                codRevenue = codRevenue.add(amount);
            } else {
                prepaidOrders++;
                prepaidRevenue = prepaidRevenue.add(amount);
            }

            for (var item : order.getItems()) {
                String pid = item.getProduct().getId();
                TopSellingProductResponse current = productStatsMap.getOrDefault(pid, new TopSellingProductResponse(
                        pid, item.getProduct().getName(), item.getProduct().getImageUrl(), 0, BigDecimal.ZERO
                ));
                long newQty = current.totalQuantitySold() + item.getQuantity();
                BigDecimal itemRevenue = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal newRev = current.totalRevenueGenerated().add(itemRevenue);
                productStatsMap.put(pid, new TopSellingProductResponse(pid, current.productName(), current.imageUrl(), newQty, newRev));
            }
        }

        List<TopSellingProductResponse> topSelling = productStatsMap.values().stream()
                .sorted((a, b) -> Long.compare(b.totalQuantitySold(), a.totalQuantitySold()))
                .limit(5) // Get top 5 selling items securely
                .toList();

        return new AnalyticsResponse(
                totalRevenue, prepaidRevenue, codRevenue,
                totalOrders, prepaidOrders, codOrders, topSelling
        );
    }
}
