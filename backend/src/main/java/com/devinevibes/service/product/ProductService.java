package com.devinevibes.service.product;

import com.devinevibes.dto.product.CreateProductRequest;
import com.devinevibes.dto.product.ProductResponse;
import com.devinevibes.entity.product.Product;
import com.devinevibes.exception.ProductNotFoundException;
import com.devinevibes.repository.product.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(this::map).toList();
    }

    public ProductResponse getById(UUID id) {
        return map(fetchEntity(id));
    }

    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        applyMedia(request, product);
        return map(productRepository.save(product));
    }

    public ProductResponse update(UUID id, CreateProductRequest request) {
        Product p = fetchEntity(id);
        p.setName(request.name());
        p.setDescription(request.description());
        p.setPrice(request.price());
        p.setStock(request.stock());
        applyMedia(request, p);
        return map(productRepository.save(p));
    }

    public void delete(UUID id) {
        productRepository.delete(fetchEntity(id));
    }

    public Product fetchEntity(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }

    private ProductResponse map(Product p) {
        var images = p.getImageUrls() == null ? List.<String>of() : p.getImageUrls();
        var videos = p.getVideoUrls() == null ? List.<String>of() : p.getVideoUrls();
        String thumbnail = p.getImageUrl();
        if ((thumbnail == null || thumbnail.isBlank()) && !images.isEmpty()) {
            thumbnail = images.get(0);
        }
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock(), thumbnail, images, videos);
    }

    private void applyMedia(CreateProductRequest request, Product product) {
        product.setImageUrl(request.imageUrl());
        if (request.imageUrls() != null) {
            product.setImageUrls(request.imageUrls().stream().filter(u -> u != null && !u.isBlank()).toList());
        } else if (request.imageUrl() != null && !request.imageUrl().isBlank()) {
            product.setImageUrls(List.of(request.imageUrl()));
        }
        if (request.videoUrls() != null) {
            product.setVideoUrls(request.videoUrls().stream().filter(u -> u != null && !u.isBlank()).toList());
        }
    }
}
