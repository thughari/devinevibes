package com.devinevibes.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadFile(MultipartFile file, String userId);
    String uploadFromUrl(String externalUrl, String userId);
    void deleteFile(String fileUrl);
}
