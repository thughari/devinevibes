package com.devinevibes.repository.category;

import com.devinevibes.entity.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, String> {
    Optional<Category> findByName(String name);
    Optional<Category> findBySlug(String slug);
}
