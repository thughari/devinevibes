package com.devinevibes.client;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ShiprocketClient {
    public ShipmentResponse createShipment(String orderId) {
        return new ShipmentResponse("ship_" + UUID.randomUUID(), "trk_" + UUID.randomUUID());
    }

    public record ShipmentResponse(String shipmentId, String trackingId) {}
}
