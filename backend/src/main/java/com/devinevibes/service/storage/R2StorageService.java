package com.devinevibes.service.storage;

import com.devinevibes.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "r2")
@Slf4j
public class R2StorageService implements StorageService {

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket.products}")
    private String productBucket;

    @Value("${cloudflare.r2.public-url.products}")
    private String productsPublicUrl;

    @Value("${cloudflare.r2.bucket.avatars}")
    private String avatarBucket;

    @Value("${cloudflare.r2.public-url.avatars}")
    private String avatarPublicUrl;

    public R2StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Override
    public String uploadFile(MultipartFile file, String userId) {
        try {
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String normalizedName = originalName.trim().replaceAll("\\s+", "-").replaceAll("[^a-zA-Z0-9._-]", "");
            String key = (userId == null || userId.isEmpty() ? "" : userId + "/") + UUID.randomUUID() + "-"
                    + normalizedName;
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(productBucket)
                    .key(key)
                    .contentType(contentType)
                    .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return productsPublicUrl + "/" + java.net.URLEncoder.encode(key, java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file");
        }
    }

    @Override
    public String uploadFromUrl(String externalUrl, String userId) {
        try {
            URL url = URI.create(externalUrl).toURL();
            String fileName = Paths.get(url.getPath()).getFileName().toString();
            String normalizedName = fileName.trim().replaceAll("\\s+", "-").replaceAll("[^a-zA-Z0-9._-]", "");
            String key = (userId == null || userId.isEmpty() ? "" : userId + "/") + UUID.randomUUID() + "-"
                    + normalizedName;
            String contentType = java.net.URLConnection.guessContentTypeFromName(fileName);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            byte[] bytes = url.openStream().readAllBytes();
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(avatarBucket)
                    .key(key)
                    .contentType(contentType)
                    .build(),
                    RequestBody.fromBytes(bytes));
            return avatarPublicUrl + "/" + java.net.URLEncoder.encode(key, java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file from URL");
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            URI uri = URI.create(fileUrl);
            String key = uri.getPath().replaceFirst("^/", "");
            String bucket = fileUrl.contains(avatarPublicUrl) ? avatarBucket : productBucket;
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (Exception ex) {
            log.warn("Failed to delete file {}", fileUrl);
        }
    }
}
