package com.devinevibes.dto.auth;

import com.devinevibes.dto.user.UserResponse;

public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {
}
