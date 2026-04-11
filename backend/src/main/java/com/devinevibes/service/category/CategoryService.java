package com.devinevibes.service.category;

import com.devinevibes.entity.category.Category;
import com.devinevibes.repository.category.CategoryRepository;
import com.devinevibes.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @org.springframework.cache.annotation.Cacheable(value = "categories", key = "'active'")
    public List<Category> getActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .toList();
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        // Generate Meaningful ID: CAT-SLUG
        category.setId("CAT-" + category.getSlug().toUpperCase());
        return categoryRepository.save(category);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(String id, Category details) {
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
    public Category getDefaultCategory() {
        return categoryRepository.findById("CAT-UNCATEGORIZED")
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setId("CAT-UNCATEGORIZED");
                cat.setName("Uncategorized");
                cat.setSlug("uncategorized");
                cat.setDescription("Default system category for unassigned products");
                cat.setActive(false);
                return categoryRepository.save(cat);
            });
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(String id) {
        if ("CAT-UNCATEGORIZED".equals(id)) {
            throw new com.devinevibes.exception.BadRequestException("Cannot delete the default Uncategorized category.");
        }
        
        List<com.devinevibes.entity.product.Product> attachedProducts = productRepository.findAll().stream()
            .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(id))
            .toList();
            
        if (!attachedProducts.isEmpty()) {
            Category defaultCat = getDefaultCategory();
                
            for (com.devinevibes.entity.product.Product p : attachedProducts) {
                p.setCategory(defaultCat);
                productRepository.save(p);
            }
        }
        
        categoryRepository.deleteById(id);
    }
}
