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
import java.util.UUID;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
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
        return map(couponRepository.save(coupon));
    }

    public List<CouponResponse> list() {
        return couponRepository.findAll().stream().map(this::map).toList();
    }

    public void delete(UUID id) {
        couponRepository.deleteById(id);
    }

    public ApplyCouponResponse apply(ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.code())
                .orElseThrow(() -> new BadRequestException("Coupon not found"));
        if (!coupon.isActive()) throw new BadRequestException("Coupon is inactive");
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Coupon expired");
        }

        BigDecimal cartTotal = request.cartTotal() == null ? BigDecimal.ZERO : request.cartTotal();
        if (coupon.getMinimumCartValue() != null && cartTotal.compareTo(coupon.getMinimumCartValue()) < 0) {
            throw new BadRequestException("Minimum cart value not reached");
        }

        BigDecimal discount = BigDecimal.ZERO;
        String message;
        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = cartTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            message = coupon.getDiscountValue() + "% discount applied";
        } else if (coupon.getType() == CouponType.FIXED) {
            discount = coupon.getDiscountValue();
            message = "Flat discount applied";
        } else {
            int qty = request.quantity() == null ? 0 : request.quantity();
            if (coupon.getBuyQty() == null || coupon.getGetQty() == null || qty < coupon.getBuyQty()) {
                throw new BadRequestException("BXGX conditions not satisfied");
            }
            int freeItems = qty / coupon.getBuyQty() * coupon.getGetQty();
            BigDecimal unitPrice = qty > 0 ? cartTotal.divide(BigDecimal.valueOf(qty), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
            discount = unitPrice.multiply(BigDecimal.valueOf(freeItems));
            message = "BXGX coupon applied";
        }
        if (discount.compareTo(cartTotal) > 0) discount = cartTotal;
        return new ApplyCouponResponse(coupon.getCode(), discount, cartTotal.subtract(discount), message);
    }

    private CouponResponse map(Coupon c) {
        return new CouponResponse(c.getId(), c.getCode(), c.getType(), c.getDiscountValue(), c.getMinimumCartValue(),
                c.getBuyQty(), c.getGetQty(), c.getProductId(), c.isActive(), c.getExpiresAt());
    }
}
