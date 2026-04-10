package com.devinevibes.service.coupon;

import com.devinevibes.dto.coupon.*;
import com.devinevibes.entity.coupon.Coupon;
import com.devinevibes.entity.coupon.CouponType;
import com.devinevibes.exception.BadRequestException;
import com.devinevibes.repository.coupon.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class CouponService {
    private final CouponRepository couponRepository;
    private final com.devinevibes.repository.order.OrderRepository orderRepository;

    public CouponService(CouponRepository couponRepository, com.devinevibes.repository.order.OrderRepository orderRepository) {
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
    }

    public CouponResponse create(CreateCouponRequest request) {
        Coupon coupon = new Coupon();
        coupon.setCode(request.code().trim().toUpperCase());
        coupon.setType(request.type());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinimumCartValue(request.minimumCartValue());
        coupon.setBuyQty(request.buyQty());
        coupon.setGetQty(request.getQty());
        coupon.setProductId(request.productId());
        coupon.setActive(request.active() == null || request.active());
        coupon.setExpiresAt(request.expiresAt());
        coupon.setMaxUses(request.maxUses());
        coupon.setMaxUsesPerUser(request.maxUsesPerUser());
        return map(couponRepository.save(coupon));
    }

    public CouponResponse update(String id, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Coupon not found"));
        coupon.setCode(request.code().trim().toUpperCase());
        coupon.setType(request.type());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinimumCartValue(request.minimumCartValue());
        coupon.setBuyQty(request.buyQty());
        coupon.setGetQty(request.getQty());
        coupon.setProductId(request.productId());
        coupon.setActive(request.active() == null || request.active());
        coupon.setExpiresAt(request.expiresAt());
        coupon.setMaxUses(request.maxUses());
        coupon.setMaxUsesPerUser(request.maxUsesPerUser());
        return map(couponRepository.save(coupon));
    }

    public List<CouponResponse> list() {
        return couponRepository.findAll().stream().map(this::map).toList();
    }

    public List<CouponResponse> getActiveCoupons() {
        Instant now = Instant.now();
        return couponRepository.findAll().stream()
                .filter(Coupon::isActive)
                .filter(c -> c.getExpiresAt() == null || c.getExpiresAt().isAfter(now))
                .filter(c -> c.getMaxUses() == null || c.getUsageCount() < c.getMaxUses())
                .map(this::map)
                .toList();
    }

    public void delete(String id) {
        couponRepository.deleteById(id);
    }

    public ApplyCouponResponse apply(String email, ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.code())
                .orElseThrow(() -> new BadRequestException("Coupon not found"));
        if (!coupon.isActive()) throw new BadRequestException("Coupon is inactive");
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Coupon expired");
        }
        
        // General limit
        if (coupon.getMaxUses() != null && coupon.getUsageCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("Coupon usage limit exceeded");
        }
        
        // Targeted limit
        if (coupon.getMaxUsesPerUser() != null && email != null) {
            long userUsages = orderRepository.findAll().stream()
                .filter(o -> o.getUser() != null && o.getUser().getEmail().equals(email))
                .filter(o -> o.getAppliedCoupon() != null && o.getAppliedCoupon().equalsIgnoreCase(request.code()))
                .filter(o -> o.getOrderStatus() != com.devinevibes.entity.order.OrderStatus.CANCELLED)
                .count();
            if (userUsages >= coupon.getMaxUsesPerUser()) {
                throw new BadRequestException("You have reached the usage limit for this coupon.");
            }
        }

        BigDecimal cartTotal = request.cartTotal() == null ? BigDecimal.ZERO : request.cartTotal();
        if (coupon.getMinimumCartValue() != null && cartTotal.compareTo(coupon.getMinimumCartValue()) < 0) {
            throw new BadRequestException("Minimum cart value not reached");
        }

        BigDecimal discount = BigDecimal.ZERO;
        String message;
        String productIdToAdd = null;
        Integer quantityToAdd = null;
        String targetProductId = null;
        Integer freeQuantity = 0;

        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = cartTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            message = coupon.getDiscountValue() + "% discount applied";
        } else if (coupon.getType() == CouponType.FIXED) {
            discount = coupon.getDiscountValue();
            message = "Flat discount applied";
        } else {
            int qty = request.quantity() == null ? 0 : request.quantity();
            int requiredForOneSet = (coupon.getBuyQty() == null ? 0 : coupon.getBuyQty()) + (coupon.getGetQty() == null ? 0 : coupon.getGetQty());
            
            // If specific product coupon and not enough for even one set but has at least buyQty
            if (coupon.getProductId() != null && qty < requiredForOneSet && qty >= coupon.getBuyQty()) {
                productIdToAdd = coupon.getProductId();
                quantityToAdd = requiredForOneSet - qty;
                message = "Adding fee items to satisfy Buy One Get One!";
            } else if (coupon.getBuyQty() == null || coupon.getGetQty() == null || qty < coupon.getBuyQty()) {
                throw new BadRequestException("BXGX conditions not satisfied");
            } else {
                int freeItems = (qty / requiredForOneSet) * coupon.getGetQty();
                BigDecimal unitPrice = qty > 0 ? cartTotal.divide(BigDecimal.valueOf(qty), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
                discount = unitPrice.multiply(BigDecimal.valueOf(freeItems));
                message = "Buy " + coupon.getBuyQty() + " Get " + coupon.getGetQty() + " FREE applied";
                
                if (freeItems > 0 && coupon.getProductId() != null) {
                    targetProductId = coupon.getProductId();
                    freeQuantity = freeItems;
                }
            }
        }
        if (discount.compareTo(cartTotal) > 0) discount = cartTotal;
        return new ApplyCouponResponse(
            coupon.getCode(), 
            discount, 
            cartTotal.subtract(discount), 
            message,
            productIdToAdd,
            quantityToAdd,
            freeQuantity,
            targetProductId
        );
    }

    public void incrementUsage(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(coupon -> {
            int current = coupon.getUsageCount() == null ? 0 : coupon.getUsageCount();
            coupon.setUsageCount(current + 1);
            couponRepository.save(coupon);
        });
    }

    private CouponResponse map(Coupon c) {
        return new CouponResponse(c.getId(), c.getCode(), c.getType(), c.getDiscountValue(), c.getMinimumCartValue(),
                c.getBuyQty(), c.getGetQty(), c.getProductId(), c.isActive(), c.getExpiresAt(),
                c.getMaxUses(), c.getMaxUsesPerUser(), c.getUsageCount());
    }
}
