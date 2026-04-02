package com.devinevibes.service.user;

import com.devinevibes.dto.user.UpdateUserProfileRequest;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.UserNotFoundException;
import com.devinevibes.repository.user.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User updateProfile(String currentEmail, UpdateUserProfileRequest request) {
        User user = getByEmail(currentEmail);
        if (request.name() != null && !request.name().isBlank()) user.setName(request.name().trim());
        if (request.phone() != null && !request.phone().isBlank()) user.setPhone(request.phone().trim());
        if (request.email() != null && !request.email().isBlank()) user.setEmail(request.email().trim().toLowerCase());
        return userRepository.save(user);
    }
}
