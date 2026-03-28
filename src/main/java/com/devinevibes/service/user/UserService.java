package com.devinevibes.service.user;

import com.devinevibes.dto.user.UserResponse;

public interface UserService {
    UserResponse me(Long userId);
}
