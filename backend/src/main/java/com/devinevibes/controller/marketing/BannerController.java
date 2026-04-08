package com.devinevibes.controller.marketing;

import com.devinevibes.dto.marketing.BannerRequest;
import com.devinevibes.dto.marketing.BannerResponse;
import com.devinevibes.service.marketing.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Public endpoint for active banners
    @GetMapping("/banners")
    public List<BannerResponse> getActiveBanners() {
        return bannerService.getActiveBanners();
    }

    // Admin endpoints
    @GetMapping("/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BannerResponse> getAll() {
        return bannerService.getAll();
    }

    @PostMapping("/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public BannerResponse create(@RequestBody BannerRequest request) {
        return bannerService.create(request);
    }

    @PutMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BannerResponse update(@PathVariable UUID id, @RequestBody BannerRequest request) {
        return bannerService.update(id, request);
    }

    @DeleteMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bannerService.delete(id);
        return ResponseEntity.ok().build();
    }
}
