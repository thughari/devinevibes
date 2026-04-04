package com.devinevibes.controller.coupon;

import com.devinevibes.dto.coupon.ApplyCouponRequest;
import com.devinevibes.dto.coupon.ApplyCouponResponse;
import com.devinevibes.service.coupon.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApplyCouponResponse> apply(java.security.Principal principal, @RequestBody ApplyCouponRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(couponService.apply(email, request));
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<com.devinevibes.dto.coupon.CouponResponse>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }
}
