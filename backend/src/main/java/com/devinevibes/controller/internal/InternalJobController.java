package com.devinevibes.controller.internal;

import com.devinevibes.service.order.OrderCleanupService;
import com.devinevibes.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/jobs")
@RequiredArgsConstructor
@Slf4j
public class InternalJobController {

    private final OrderCleanupService orderCleanupService;
    private final OrderService orderService;

    @Value("${app.internal.job-secret:default-scheduler-secret}")
    private String jobSecret;

    @PostMapping("/cleanup-orders")
    public ResponseEntity<String> cleanupOrders(@RequestHeader(value = "X-Internal-Job-Secret", required = false) String secret) {
        if (!jobSecret.equals(secret)) {
            log.warn("Unauthorized access attempt to internal jobs endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        log.info("Triggering background order cleanup jobs via internal API");
        try {
            orderCleanupService.cancelStaleOrders();
            orderService.autoCancelAbandonedOrders();
            return ResponseEntity.ok("Jobs executed successfully");
        } catch (Exception e) {
            log.error("Failed to execute cleanup jobs", e);
            return ResponseEntity.internalServerError().body("Job execution failed");
        }
    }
}
