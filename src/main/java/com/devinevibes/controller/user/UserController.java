package com.devinevibes.controller.user;

import com.devinevibes.dto.user.UserProfileResponse;
import com.devinevibes.entity.user.User;
import com.devinevibes.service.user.UserService;
import com.devinevibes.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me() {
        User user = userService.getByEmail(SecurityUtils.currentPrincipalEmail());
        return ResponseEntity.ok(new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getProfileImageUrl(), user.getProvider(), user.getRole()));
    }
}
