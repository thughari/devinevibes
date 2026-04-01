package com.devinevibes.repository.product;

import com.devinevibes.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrueAndCategoryContainingIgnoreCaseAndNameContainingIgnoreCase(String category, String name, Pageable pageable);
}
