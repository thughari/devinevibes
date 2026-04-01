package com.devinevibes.repository.user;

import com.devinevibes.entity.user.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
