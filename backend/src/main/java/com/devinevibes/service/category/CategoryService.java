package com.devinevibes.service.category;

import com.devinevibes.entity.category.Category;
import com.devinevibes.repository.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @org.springframework.cache.annotation.Cacheable(value = "categories", key = "'active'")
    public List<Category> getActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .toList();
    }

    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return categoryRepository.save(category);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(UUID id, Category details) {
        Category category = getCategoryById(id);
        category.setName(details.getName());
        category.setDescription(details.getDescription());
        category.setImageUrl(details.getImageUrl());
        category.setActive(details.isActive());
        
        if (details.getSlug() != null && !details.getSlug().isBlank()) {
            category.setSlug(details.getSlug());
        } else {
            category.setSlug(details.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        
        return categoryRepository.save(category);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }
}
