package com.devinevibes.service.user;

import com.devinevibes.dto.user.UserResponse;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.ResourceNotFoundException;
import com.devinevibes.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse me(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole().name());
    }
}
