package com.devinevibes.dto.user;

import com.devinevibes.entity.user.AuthProvider;
import com.devinevibes.entity.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(UUID id, String name, String email, String phone, String profileImageUrl, AuthProvider provider, UserRole role, Instant createdAt) {}
