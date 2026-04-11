package com.devinevibes.dto.order;

import java.util.List;

public record LiveTrackingResponse(
        String courierName,
        String currentStatus,
        String estimatedDelivery,
        List<ShipmentScanDto> scans
) {}
