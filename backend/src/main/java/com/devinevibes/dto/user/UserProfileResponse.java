package com.devinevibes.dto.user;

import com.devinevibes.entity.user.AuthProvider;
import com.devinevibes.entity.user.UserRole;

import java.time.Instant;

public record UserProfileResponse(String id, String name, String email, String phone, AuthProvider provider, UserRole role, Instant createdAt) {}
