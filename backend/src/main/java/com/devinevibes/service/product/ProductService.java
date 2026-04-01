package com.devinevibes.service.product;

import com.devinevibes.dto.product.CreateProductRequest;
import com.devinevibes.dto.product.ProductResponse;
import com.devinevibes.entity.product.Product;
import com.devinevibes.exception.ProductNotFoundException;
import com.devinevibes.repository.product.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable("products")
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(this::map).toList();
    }

    public ProductResponse getById(UUID id) {
        return map(fetchEntity(id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(request.imageUrl());
        return map(productRepository.save(product));
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse update(UUID id, CreateProductRequest request) {
        Product p = fetchEntity(id);
        p.setName(request.name());
        p.setDescription(request.description());
        p.setPrice(request.price());
        p.setStock(request.stock());
        p.setImageUrl(request.imageUrl());
        return map(productRepository.save(p));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void delete(UUID id) {
        productRepository.delete(fetchEntity(id));
    }

    public Product fetchEntity(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }

    private ProductResponse map(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock(), p.getImageUrl());
    }
}
