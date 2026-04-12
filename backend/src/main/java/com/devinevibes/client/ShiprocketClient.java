package com.devinevibes.client;

import com.devinevibes.entity.order.Order;
import com.devinevibes.entity.order.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ShiprocketClient {

    private final String baseUrl = "https://apiv2.shiprocket.in";

    private final String email;
    private final String password;
    private final RestTemplate restTemplate;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    private static final String REDIS_KEY = "shiprocket:token";

    public ShiprocketClient(
            @Value("${shiprocket.email}") String email,
            @Value("${shiprocket.password}") String password,
            org.springframework.data.redis.core.StringRedisTemplate redisTemplate) {
        this.email = email;
        this.password = password;
        this.redisTemplate = redisTemplate;
        this.restTemplate = new RestTemplate();
    }

    private String getToken() {
        String token = redisTemplate.opsForValue().get(REDIS_KEY);
        if (token != null && !token.isBlank()) {
            return token;
        }

        String url = "https://apiv2.shiprocket.in/v1/external/auth/login";
        Map<String, String> body = Map.of("email", email, "password", password);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url,
                    org.springframework.http.HttpMethod.POST, entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String newToken = (String) response.getBody().get("token");
                if (newToken != null) {
                    // Cache in Redis for 10 days
                    redisTemplate.opsForValue().set(REDIS_KEY, newToken, java.time.Duration.ofDays(10));
                    return newToken;
                }
            }
        } catch (Exception e) {
            log.error("Shiprocket authentication failed: {}", e.getMessage());
        }
        return null;
    }

    private void clearToken() {
        redisTemplate.delete(REDIS_KEY);
    }

    private <T> ResponseEntity<T> executeWithRetry(String url, org.springframework.http.HttpMethod method,
            HttpEntity<?> entity, org.springframework.core.ParameterizedTypeReference<T> responseType) {
        int maxRetries = 3;
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                ResponseEntity<T> response = restTemplate.exchange(url, method, entity, responseType);
                return response;
            } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
                log.warn("Shiprocket unauthorized (401). Clearing token and retrying login.");
                clearToken();
                String newToken = getToken();
                if (newToken == null)
                    return null;

                // Update headers with new token
                HttpHeaders newHeaders = new HttpHeaders();
                newHeaders.addAll(entity.getHeaders());
                newHeaders.setBearerAuth(newToken);
                entity = new HttpEntity<>(entity.getBody(), newHeaders);
            } catch (Exception e) {
                attempt++;
                if (attempt >= maxRetries) {
                    log.error("Shiprocket API call failed after {} attempts: {}", maxRetries, e.getMessage());
                    throw e;
                }
                log.warn("Shiprocket API call failed (attempt {}/{}). Retrying in 1s...", attempt, maxRetries);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return null;
    }

    public ShipmentResponse createShipment(Order order) {
        String token = getToken();
        if (token == null) {
            return new ShipmentResponse("ERROR", "AUTH_FAILED", "PENDING_MANUAL_DISPATCH");
        }
        String url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("name", item.getProduct().getName());
            String sku = item.getProduct().getId().toString();
            itemMap.put("sku", sku);
            itemMap.put("units", item.getQuantity());
            itemMap.put("selling_price", item.getUnitPrice());
            items.add(itemMap);
        }

        Map<String, Object> req = new HashMap<>();
        req.put("order_id", order.getId());
        req.put("order_date",
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        req.put("pickup_location", "Home");

        req.put("billing_customer_name",
                order.getShippingFirstName() != null && !order.getShippingFirstName().isBlank()
                        ? order.getShippingFirstName()
                        : "Customer");
        req.put("billing_last_name", order.getShippingLastName() != null ? order.getShippingLastName() : "");
        req.put("billing_address",
                order.getShippingAddress() != null && !order.getShippingAddress().isBlank() ? order.getShippingAddress()
                        : "Default Full Address");
        req.put("billing_address_2", "Near Landmark");
        req.put("billing_city",
                order.getShippingCity() != null && !order.getShippingCity().isBlank() ? order.getShippingCity()
                        : "City");
        req.put("billing_pincode",
                order.getShippingPostalCode() != null && !order.getShippingPostalCode().isBlank()
                        ? order.getShippingPostalCode()
                        : "110001");
        req.put("billing_state",
                order.getShippingState() != null && !order.getShippingState().isBlank() ? order.getShippingState()
                        : "State");
        req.put("billing_country", "India");
        req.put("billing_email",
                order.getShippingEmail() != null && !order.getShippingEmail().isBlank() ? order.getShippingEmail()
                        : "email@example.com");
        req.put("billing_phone",
                order.getShippingPhone() != null && !order.getShippingPhone().isBlank() ? order.getShippingPhone()
                        : "9999999999");
        req.put("shipping_is_billing", true);

        req.put("shipping_customer_name", req.get("billing_customer_name"));
        req.put("shipping_last_name", req.get("billing_last_name"));
        req.put("shipping_address", req.get("billing_address"));
        req.put("shipping_address_2", req.get("billing_address_2"));
        req.put("shipping_city", req.get("billing_city"));
        req.put("shipping_pincode", req.get("billing_pincode"));
        req.put("shipping_state", req.get("billing_state"));
        req.put("shipping_country", req.get("billing_country"));
        req.put("shipping_email", req.get("billing_email"));
        req.put("shipping_phone", req.get("billing_phone"));

        req.put("order_items", items);
        req.put("payment_method", order.getPaymentMethod() != null ? order.getPaymentMethod() : "Prepaid");
        req.put("sub_total", order.getTotalAmount());

        // Dynamic Shipping Dimensions
        double totalWeightGrams = 0;
        double maxLength = 10;
        double maxBreadth = 10;
        double maxHeight = 10;

        for (OrderItem item : order.getItems()) {
            com.devinevibes.entity.product.Product p = item.getProduct();
            int qty = item.getQuantity();

            if (p.getWeight() != null)
                totalWeightGrams += p.getWeight().doubleValue() * qty;
            if (p.getLength() != null)
                maxLength = Math.max(maxLength, p.getLength().doubleValue());
            if (p.getBreadth() != null)
                maxBreadth = Math.max(maxBreadth, p.getBreadth().doubleValue());
            if (p.getHeight() != null)
                maxHeight = Math.max(maxHeight, p.getHeight().doubleValue());
        }

        // Shiprocket requires weight in KG and dimensions in CM
        // We use the maximum dimension designated for any item in the order
        // since small items are typically packed into the largest item's box.
        req.put("length", Math.max(10.0, maxLength));
        req.put("breadth", Math.max(10.0, maxBreadth));
        req.put("height", Math.max(10.0, maxHeight));
        req.put("weight", Math.max(0.5, totalWeightGrams / 1000.0));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);
        try {
            ResponseEntity<Map<String, Object>> response = executeWithRetry(url,
                    org.springframework.http.HttpMethod.POST, entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            if (response != null && response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> resBody = response.getBody();
                Object orderIdFromRes = resBody.get("order_id");
                Object shipmentId = resBody.get("shipment_id");
                Object awb = resBody.get("awb_code");

                if ((orderIdFromRes == null || shipmentId == null) && resBody.get("data") instanceof Map) {
                    Map<String, Object> dataMap = (Map<String, Object>) resBody.get("data");
                    orderIdFromRes = dataMap.get("order_id") != null ? dataMap.get("order_id") : orderIdFromRes;
                    shipmentId = dataMap.get("shipment_id") != null ? dataMap.get("shipment_id") : shipmentId;
                    awb = dataMap.get("awb_code") != null ? dataMap.get("awb_code") : awb;
                }

                if (shipmentId == null) {
                    throw new RuntimeException("Logical API Error (200 OK): " + resBody.get("message"));
                }

                return new ShipmentResponse(
                        orderIdFromRes != null ? orderIdFromRes.toString() : "N/A",
                        shipmentId.toString(),
                        awb != null ? awb.toString() : "PENDING_AWB");
            }
            throw new RuntimeException("Failed to create Shiprocket Order after retries");
        } catch (Exception e) {
            log.error("Shiprocket shipment creation failed: {}", e.getMessage());
            return new ShipmentResponse("ERROR", "API_FAILURE", "PENDING_MANUAL_DISPATCH");
        }
    }

    public void cancelOrder(String shiprocketOrderId) {
        if (shiprocketOrderId == null || "ERROR".equals(shiprocketOrderId))
            return;
        try {
            String token = getToken();
            if (token == null)
                return;
            String url = baseUrl + "/v1/external/orders/cancel";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);
            Map<String, Object> body = Map.of("ids", java.util.List.of(shiprocketOrderId));
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            executeWithRetry(url, org.springframework.http.HttpMethod.POST, entity,
                    new org.springframework.core.ParameterizedTypeReference<String>() {
                    });
            log.info("Shiprocket order cancelled success: {}", shiprocketOrderId);
        } catch (Exception e) {
            log.error("Failed to cancel Shiprocket order {}: {}", shiprocketOrderId, e.getMessage());
        }
    }

    public com.devinevibes.dto.order.LiveTrackingResponse trackShipment(String awb) {
        if (awb == null || awb.isBlank() || awb.contains("PENDING")) {
            return new com.devinevibes.dto.order.LiveTrackingResponse(null, null, null, Collections.emptyList());
        }
        try {
            String token = getToken();
            if (token == null)
                return new com.devinevibes.dto.order.LiveTrackingResponse(null, null, null, Collections.emptyList());
            String url = baseUrl + "/v1/external/courier/track/awb/" + awb;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map<String, Object>> response = executeWithRetry(url,
                    org.springframework.http.HttpMethod.GET, entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response != null && response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body.get("tracking_data") instanceof Map) {
                    Map<String, Object> tData = (Map<String, Object>) body.get("tracking_data");
                    Integer trackStatus = (Integer) tData.get("track_status");
                    if (trackStatus != null && trackStatus == 1) {
                        String currentStatus = (String) tData.get("shipment_status");
                        String courierName = (String) tData.get("courier_name");
                        String etd = (String) tData.get("etd");
                        List<com.devinevibes.dto.order.ShipmentScanDto> scanList = new ArrayList<>();
                        if (tData.get("track_url") != null && tData.get("shipment_track_activities") != null) {
                            List<Map<String, Object>> activities = (List<Map<String, Object>>) tData
                                    .get("shipment_track_activities");
                            for (Map<String, Object> act : activities) {
                                scanList.add(new com.devinevibes.dto.order.ShipmentScanDto((String) act.get("date"),
                                        (String) act.get("activity"), (String) act.get("location")));
                            }
                        }
                        return new com.devinevibes.dto.order.LiveTrackingResponse(courierName, currentStatus, etd,
                                scanList);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch Shiprocket tracking for AWB {}: {}", awb, e.getMessage());
        }
        return new com.devinevibes.dto.order.LiveTrackingResponse(null, null, null, Collections.emptyList());
    }

    public record ShipmentResponse(String shiprocketOrderId, String shipmentId, String trackingId) {
    }
}
