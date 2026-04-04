package com.devinevibes.controller.user;

import com.devinevibes.dto.config.StoreConfigResponse;
import com.devinevibes.service.config.StoreConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class StoreConfigController {

    private final StoreConfigService configService;

    public StoreConfigController(StoreConfigService configService) {
        this.configService = configService;
    }

    @GetMapping
    public ResponseEntity<StoreConfigResponse> getStoreConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }
}
