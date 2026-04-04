package com.devinevibes.controller.admin;

import com.devinevibes.dto.config.StoreConfigResponse;
import com.devinevibes.dto.config.UpdateStoreConfigRequest;
import com.devinevibes.service.config.StoreConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/config")
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

    private final StoreConfigService configService;

    public AdminConfigController(StoreConfigService configService) {
        this.configService = configService;
    }

    @PutMapping
    public ResponseEntity<StoreConfigResponse> updateStoreConfig(@Valid @RequestBody UpdateStoreConfigRequest request) {
        return ResponseEntity.ok(configService.updateConfig(request));
    }
}
