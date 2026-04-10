package com.devinevibes.repository.product;

import com.devinevibes.entity.product.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {
    
    @EntityGraph(attributePaths = {"imageUrls", "videoUrls"})
    List<Product> findAll();

    @EntityGraph(attributePaths = {"imageUrls", "videoUrls"})
    Optional<Product> findById(String id);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") String id);
}
