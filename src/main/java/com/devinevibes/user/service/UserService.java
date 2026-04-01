package com.devinevibes.user.service;

import com.devinevibes.common.exception.ApiException;
import com.devinevibes.user.dto.UserDtos;
import com.devinevibes.user.entity.Address;
import com.devinevibes.user.entity.User;
import com.devinevibes.user.repository.AddressRepository;
import com.devinevibes.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public User getCurrentUser(String principal) {
        return userRepository.findByEmail(principal).or(() -> userRepository.findByPhoneNumber(principal))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserDtos.UserProfileResponse profile(String principal) {
        User user = getCurrentUser(principal);
        return new UserDtos.UserProfileResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), user.getProfileUrl());
    }

    public Address addAddress(String principal, UserDtos.AddressRequest request) {
        User user = getCurrentUser(principal);
        Address address = Address.builder().user(user).line1(request.line1()).line2(request.line2()).city(request.city())
                .state(request.state()).postalCode(request.postalCode()).country(request.country())
                .defaultAddress(request.defaultAddress()).build();
        return addressRepository.save(address);
    }

    public List<Address> listAddress(String principal) {
        return addressRepository.findByUser(getCurrentUser(principal));
    }
}
