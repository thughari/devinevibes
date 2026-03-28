package com.devinevibes.user.controller;

import com.devinevibes.user.dto.UserDtos;
import com.devinevibes.user.entity.Address;
import com.devinevibes.user.service.UserService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public UserDtos.UserProfileResponse profile(Principal principal) {
        return userService.profile(principal.getName());
    }

    @PostMapping("/addresses")
    public Address addAddress(Principal principal, @Valid @RequestBody UserDtos.AddressRequest request) {
        return userService.addAddress(principal.getName(), request);
    }

    @GetMapping("/addresses")
    public List<Address> addresses(Principal principal) {
        return userService.listAddress(principal.getName());
    }
}
