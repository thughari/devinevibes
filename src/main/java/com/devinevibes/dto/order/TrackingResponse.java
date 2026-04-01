package com.devinevibes.dto.order;

import com.devinevibes.entity.order.OrderStatus;

public record TrackingResponse(String trackingId, OrderStatus orderStatus) {}
