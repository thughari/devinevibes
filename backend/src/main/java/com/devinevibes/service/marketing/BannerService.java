package com.devinevibes.service.marketing;

import com.devinevibes.dto.marketing.BannerRequest;
import com.devinevibes.dto.marketing.BannerResponse;
import com.devinevibes.entity.marketing.Banner;
import com.devinevibes.repository.marketing.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    @Cacheable(value = "banners#7d", key = "'active'")
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByPriorityDesc().stream()
                .map(this::map).toList();
    }

    @Cacheable(value = "banners#7d", key = "'all'")
    public List<BannerResponse> getAll() {
        return bannerRepository.findAll().stream().map(this::map).toList();
    }

    @Transactional
    @CacheEvict(value = "banners#7d", allEntries = true)
    public BannerResponse create(BannerRequest request) {
        Banner banner = new Banner();
        updateEntity(banner, request);
        return map(bannerRepository.save(banner));
    }

    @Transactional
    @CacheEvict(value = "banners#7d", allEntries = true)
    public BannerResponse update(UUID id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        updateEntity(banner, request);
        return map(bannerRepository.save(banner));
    }

    @Transactional
    @CacheEvict(value = "banners#7d", allEntries = true)
    public void delete(UUID id) {
        bannerRepository.deleteById(id);
    }

    private void updateEntity(Banner b, BannerRequest r) {
        b.setContent(r.content());
        b.setType(r.type());
        b.setLink(r.link());
        b.setPriority(r.priority());
        b.setActive(r.active());
        b.setCanDismiss(r.canDismiss());
        b.setExpiryDate(r.expiryDate());
    }

    private BannerResponse map(Banner b) {
        return new BannerResponse(
            b.getId(), b.getContent(), b.getType(), b.getLink(), 
            b.getPriority(), b.isActive(), b.isCanDismiss(), b.getExpiryDate(), b.getCreatedAt()
        );
    }
}
