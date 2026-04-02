package com.devinevibes.controller.user;

import com.devinevibes.dto.user.AddressRequest;
import com.devinevibes.dto.user.AddressResponse;
import com.devinevibes.dto.user.UserProfileResponse;
import com.devinevibes.dto.user.UpdateUserProfileRequest;
import com.devinevibes.entity.user.User;
import com.devinevibes.service.user.UserService;
import com.devinevibes.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

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
                user.getProfileImageUrl(), user.getProvider(), user.getRole(), user.getCreatedAt()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> update(@Valid @RequestBody UpdateUserProfileRequest request) {
        User user = userService.updateProfile(SecurityUtils.currentPrincipalEmail(), request);
        return ResponseEntity.ok(new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getProfileImageUrl(), user.getProvider(), user.getRole(), user.getCreatedAt()));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponse>> addresses() {
        return ResponseEntity.ok(userService.getAddresses(SecurityUtils.currentPrincipalEmail()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressResponse> addAddress(@Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.createAddress(SecurityUtils.currentPrincipalEmail(), request));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID id) {
        userService.deleteAddress(SecurityUtils.currentPrincipalEmail(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable UUID id, @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.updateAddress(SecurityUtils.currentPrincipalEmail(), id, request));
    }
}
