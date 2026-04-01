package com.devinevibes.client;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RazorpayClient {
    public String createOrder(String receiptId, long amountInPaise) {
        return "order_" + UUID.randomUUID();
    }
}
