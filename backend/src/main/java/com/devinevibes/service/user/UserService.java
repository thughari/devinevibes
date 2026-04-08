package com.devinevibes.service.user;

import com.devinevibes.dto.user.AddressRequest;
import com.devinevibes.dto.user.AddressResponse;
import com.devinevibes.dto.user.UpdateUserProfileRequest;
import com.devinevibes.entity.user.Address;
import com.devinevibes.entity.user.User;
import com.devinevibes.exception.UserNotFoundException;
import com.devinevibes.repository.user.AddressRepository;
import com.devinevibes.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(String currentEmail, UpdateUserProfileRequest request) {
        User user = getByEmail(currentEmail);
        if (request.name() != null && !request.name().isBlank()) user.setName(request.name().trim());
        if (request.phone() != null && !request.phone().isBlank()) user.setPhone(request.phone().trim());
        if (request.email() != null && !request.email().isBlank()) user.setEmail(request.email().trim().toLowerCase());
        return userRepository.save(user);
    }

    public List<AddressResponse> getAddresses(String email) {
        User user = getByEmail(email);
        return addressRepository.findAllByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        User user = getByEmail(email);
        if (request.isDefault()) unsetDefault(user);

        Address address = new Address();
        address.setUser(user);
        address.setLine1(request.line1().trim());
        address.setLine2(request.line2());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setCountry(request.country().trim());
        address.setLabel(request.label());
        address.setDefault(request.isDefault());
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, UUID addressId) {
        User user = getByEmail(email);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new UserNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse updateAddress(String email, UUID addressId, AddressRequest request) {
        User user = getByEmail(email);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new UserNotFoundException("Address not found"));

        if (request.isDefault()) unsetDefault(user);
        address.setLine1(request.line1().trim());
        address.setLine2(request.line2());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setCountry(request.country().trim());
        address.setLabel(request.label());
        address.setDefault(request.isDefault());
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void autoSaveAddress(User user, com.devinevibes.dto.order.OrderRequest request) {
        if (user == null) return;
        
        // Check if this address (line1 + postalCode) already exists for the user
        boolean exists = addressRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .anyMatch(a -> a.getLine1().equalsIgnoreCase(request.address().trim()) 
                        && a.getPostalCode().equals(request.postalCode().trim()));
        
        if (!exists) {
            Address address = new Address();
            address.setUser(user);
            address.setLine1(request.address().trim());
            address.setCity(request.city().trim());
            address.setState(request.state().trim());
            address.setPostalCode(request.postalCode().trim());
            address.setCountry("India"); // Default for now
            address.setLabel("Order Address");
            address.setDefault(false);
            addressRepository.save(address);
        }
    }

    private void unsetDefault(User user) {
        var addresses = addressRepository.findAllByUserOrderByCreatedAtDesc(user);
        addresses.forEach(a -> a.setDefault(false));
        addressRepository.saveAll(addresses);
    }

    private AddressResponse toResponse(Address a) {
        return new AddressResponse(a.getId(), a.getLine1(), a.getLine2(), a.getCity(), a.getState(),
                a.getPostalCode(), a.getCountry(), a.getLabel(), a.isDefault(), a.getCreatedAt());
    }
}
