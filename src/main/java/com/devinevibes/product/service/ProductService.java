package com.devinevibes.product.service;

import com.devinevibes.common.exception.ApiException;
import com.devinevibes.product.dto.ProductDtos;
import com.devinevibes.product.entity.Product;
import com.devinevibes.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    @Cacheable(value = "products", key = "#page + '-' + #size + '-' + #query")
    public Page<Product> list(int page, int size, String query) {
        return productRepository.findByActiveTrueAndNameContainingIgnoreCase(query, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Cacheable(value = "product", key = "#id")
    public Product get(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product create(ProductDtos.ProductRequest request) {
        return productRepository.save(Product.builder().name(request.name()).description(request.description()).price(request.price())
                .stock(request.stock()).category(request.category()).imageUrl(request.imageUrl()).active(request.active()).build());
    }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
