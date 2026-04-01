package com.devinevibes.service.product;

import com.devinevibes.dto.product.ProductRequest;
import com.devinevibes.dto.product.ProductResponse;
import com.devinevibes.entity.product.Product;
import com.devinevibes.exception.ResourceNotFoundException;
import com.devinevibes.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @CacheEvict(cacheNames = {"products:all", "product"}, allEntries = true)
    public ProductResponse create(ProductRequest request) {
        Product product = map(request, Product.builder().build());
        return map(productRepository.save(product));
    }

    @Override
    @CacheEvict(cacheNames = {"products:all", "product"}, allEntries = true)
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return map(productRepository.save(map(request, product)));
    }

    @Override
    @CacheEvict(cacheNames = {"products:all", "product"}, allEntries = true)
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    @Cacheable(cacheNames = "product", key = "'product:' + #id")
    public ProductResponse get(Long id) {
        return map(productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    @Override
    @Cacheable(cacheNames = "products:all", key = "'products:all:' + #category + ':' + #query + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> list(String category, String query, Pageable pageable) {
        return productRepository.findByActiveTrueAndCategoryContainingIgnoreCaseAndNameContainingIgnoreCase(
                category == null ? "" : category,
                query == null ? "" : query,
                pageable
        ).map(this::map);
    }

    private Product map(ProductRequest request, Product product) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setCategory(request.category());
        product.setImageUrl(request.imageUrl());
        product.setActive(request.active());
        return product;
    }

    private ProductResponse map(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock(), p.getCategory(), p.getImageUrl(), p.isActive());
    }
}
