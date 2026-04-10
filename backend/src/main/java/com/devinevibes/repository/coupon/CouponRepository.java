package com.devinevibes.repository.coupon;

import com.devinevibes.entity.coupon.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import java.util.List;
import java.time.Instant;

public interface CouponRepository extends JpaRepository<Coupon, String> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    List<Coupon> findByActiveTrueAndExpiresAtAfterOrExpiresAtIsNull(Instant expiresAt);
}
