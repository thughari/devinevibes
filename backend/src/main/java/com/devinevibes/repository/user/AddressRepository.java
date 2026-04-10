package com.devinevibes.repository.user;

import com.devinevibes.entity.user.Address;
import com.devinevibes.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, String> {
    List<Address> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<Address> findByIdAndUser(String id, User user);
}
