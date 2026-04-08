package com.devinevibes.repository.marketing;

import com.devinevibes.entity.marketing.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BannerRepository extends JpaRepository<Banner, UUID> {
    List<Banner> findByActiveTrueOrderByPriorityDesc();
}
