package com.devinevibes.dto.auth;

public record OtpVerifyRequest(String phone, String email, String otp, String name) {}
