package com.devinevibes.service.product;

import com.devinevibes.dto.product.CreateProductRequest;
import com.devinevibes.dto.product.ProductResponse;
import com.devinevibes.entity.product.Product;
import com.devinevibes.exception.ProductNotFoundException;
import com.devinevibes.repository.product.ProductRepository;
import com.devinevibes.repository.cart.CartRepository;
import com.devinevibes.service.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final StorageService storageService;
    private final CartRepository cartRepository;

    public ProductService(ProductRepository productRepository, StorageService storageService, CartRepository cartRepository) {
        this.productRepository = productRepository;
        this.storageService = storageService;
        this.cartRepository = cartRepository;
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(this::map).toList();
    }

    public ProductResponse getById(UUID id) {
        return map(fetchEntity(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setStock(request.stock());
        applyMedia(request, product);
        return map(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(UUID id, CreateProductRequest request) {
        Product p = fetchEntity(id);

        Set<String> oldMedia = new HashSet<>();
        if (p.getImageUrl() != null && !p.getImageUrl().isBlank()) oldMedia.add(p.getImageUrl());
        if (p.getImageUrls() != null) oldMedia.addAll(p.getImageUrls());
        if (p.getVideoUrls() != null) oldMedia.addAll(p.getVideoUrls());

        p.setName(request.name());
        p.setDescription(request.description());
        p.setPrice(request.price());
        p.setOriginalPrice(request.originalPrice());
        p.setStock(request.stock());
        applyMedia(request, p);

        Set<String> newMedia = new HashSet<>();
        if (p.getImageUrl() != null && !p.getImageUrl().isBlank()) newMedia.add(p.getImageUrl());
        if (p.getImageUrls() != null) newMedia.addAll(p.getImageUrls());
        if (p.getVideoUrls() != null) newMedia.addAll(p.getVideoUrls());

        for (String url : oldMedia) {
            if (!newMedia.contains(url)) {
                storageService.deleteFile(url);
            }
        }

        return map(productRepository.save(p));
    }

    @Transactional
    public void delete(UUID id) {
        Product p = fetchEntity(id);
        
        // Remove from users' carts first to satisfy foreign key constraints
        cartRepository.deleteByProduct(p);
        
        if (p.getImageUrl() != null && !p.getImageUrl().isBlank()) storageService.deleteFile(p.getImageUrl());
        if (p.getImageUrls() != null) p.getImageUrls().forEach(storageService::deleteFile);
        if (p.getVideoUrls() != null) p.getVideoUrls().forEach(storageService::deleteFile);
        productRepository.delete(p);
    }

    public Product fetchEntity(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }

    @Transactional
    public Product reserveStock(Product p, int quantity) {
        // Essential for rock-solid concurrency (SELECT FOR UPDATE)
        Product product = productRepository.findByIdWithLock(p.getId())
                .orElseThrow(() -> new ProductNotFoundException("Product for reservation not found"));
                
        if (product.getStock() < quantity) {
            throw new com.devinevibes.exception.BadRequestException("Insufficient stock for product " + product.getName());
        }
        product.setStock(product.getStock() - quantity);
        return productRepository.save(product);
    }

    @Transactional
    public void releaseStock(Product p, int quantity) {
        Product product = productRepository.findByIdWithLock(p.getId())
                .orElseThrow(() -> new ProductNotFoundException("Product for release not found"));
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }

    private ProductResponse map(Product p) {
        var imagesSet = p.getImageUrls() == null ? java.util.Set.<String>of() : p.getImageUrls();
        var videosSet = p.getVideoUrls() == null ? java.util.Set.<String>of() : p.getVideoUrls();
        
        List<String> images = new java.util.ArrayList<>(imagesSet);
        List<String> videos = new java.util.ArrayList<>(videosSet);
        
        String thumbnail = p.getImageUrl();
        if ((thumbnail == null || thumbnail.isBlank()) && !images.isEmpty()) {
            thumbnail = images.get(0);
        }
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getOriginalPrice(), p.getStock(), thumbnail, images, videos);
    }

    private void applyMedia(CreateProductRequest request, Product product) {
        product.setImageUrl(request.imageUrl());
        if (request.imageUrls() != null) {
            product.setImageUrls(new java.util.LinkedHashSet<>(request.imageUrls().stream().filter(u -> u != null && !u.isBlank()).toList()));
        } else if (request.imageUrl() != null && !request.imageUrl().isBlank()) {
            product.setImageUrls(new java.util.LinkedHashSet<>(List.of(request.imageUrl())));
        }
        if (request.videoUrls() != null) {
            product.setVideoUrls(new java.util.LinkedHashSet<>(request.videoUrls().stream().filter(u -> u != null && !u.isBlank()).toList()));
        }
    }
}
