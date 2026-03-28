package com.devinevibes.user.dto;

import jakarta.validation.constraints.NotBlank;

public class UserDtos {
    public record UserProfileResponse(Long id, String fullName, String email, String phoneNumber, String profileUrl) {}
    public record AddressRequest(@NotBlank String line1, String line2, @NotBlank String city, @NotBlank String state,
                                 @NotBlank String postalCode, @NotBlank String country, boolean defaultAddress) {}
}
