package com.devinevibes.service.product;

import com.devinevibes.dto.product.ProductRequest;
import com.devinevibes.dto.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
    ProductResponse get(Long id);
    Page<ProductResponse> list(String category, String query, Pageable pageable);
}
