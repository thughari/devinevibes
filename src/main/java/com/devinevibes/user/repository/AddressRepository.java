package com.devinevibes.user.repository;

import com.devinevibes.user.entity.Address;
import com.devinevibes.user.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
}
