package com.devinevibes.controller.user;

import com.devinevibes.dto.user.UserResponse;
import com.devinevibes.security.AppUserPrincipal;
import com.devinevibes.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return userService.me(principal.getUserId());
    }
}
