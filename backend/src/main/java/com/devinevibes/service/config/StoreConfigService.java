package com.devinevibes.service.config;

import com.devinevibes.dto.config.StoreConfigResponse;
import com.devinevibes.dto.config.UpdateStoreConfigRequest;
import com.devinevibes.entity.config.StoreConfig;
import com.devinevibes.repository.config.StoreConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class StoreConfigService {

    private final StoreConfigRepository configRepository;

    public StoreConfigService(StoreConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public StoreConfig getConfigEntity() {
        return configRepository.findById(1).orElseGet(() -> {
            StoreConfig newConfig = new StoreConfig();
            newConfig.setId(1);
            newConfig.setFreeShippingThreshold(BigDecimal.valueOf(700));
            newConfig.setStandardShippingCost(BigDecimal.valueOf(50));
            newConfig.setCodFee(BigDecimal.valueOf(50));
            return configRepository.save(newConfig);
        });
    }

    @Transactional(readOnly = true)
    public StoreConfigResponse getConfig() {
        StoreConfig config = getConfigEntity();
        return new StoreConfigResponse(config.getFreeShippingThreshold(), config.getStandardShippingCost(), config.getCodFee());
    }

    @Transactional
    public StoreConfigResponse updateConfig(UpdateStoreConfigRequest request) {
        StoreConfig config = getConfigEntity();
        config.setFreeShippingThreshold(request.freeShippingThreshold());
        config.setStandardShippingCost(request.standardShippingCost());
        config.setCodFee(request.codFee());
        configRepository.save(config);
        return new StoreConfigResponse(config.getFreeShippingThreshold(), config.getStandardShippingCost(), config.getCodFee());
    }
}
