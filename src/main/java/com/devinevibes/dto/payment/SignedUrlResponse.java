package com.devinevibes.dto.payment;

public record SignedUrlResponse(String uploadUrl, String fileKey, long expiresInSeconds) {
}
