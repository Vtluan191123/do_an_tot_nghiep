package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.CloudStorageService;
import com.dntn.datn_be.service.UploadFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadFileServiceImpl implements UploadFileService {

    private final CloudStorageService cloudStorageService;

    @Value("${spring.file.upload-dir}")
    private String uploadDir;

    @Value("${storage.type:local}")
    private String storageType;

    @Override
    public List<String> uploads(List<MultipartFile> files) throws IOException {
        // Use cloud storage if configured
        if ("cloud".equalsIgnoreCase(storageType)) {
            log.info("Uploading files to cloud storage");
            return cloudStorageService.uploadFiles(files);
        }

        // Fallback to local storage
        return uploadFilesLocally(files);
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(List<String> fileNames) throws IOException {
        try {
            if ("cloud".equalsIgnoreCase(storageType)) {
                log.info("Deleting files from cloud storage");
                boolean success = cloudStorageService.deleteFiles(fileNames);
                return ResponseGlobalDto.<Boolean>builder()
                        .data(success)
                        .build();
            }

            // Fallback to local storage
            return deleteFilesLocally(fileNames);
        } catch (Exception e) {
            log.error("Error deleting files", e);
            return ResponseGlobalDto.<Boolean>builder()
                    .data(false)
                    .build();
        }
    }

    /**
     * Upload files to local storage
     */
    private List<String> uploadFilesLocally(List<MultipartFile> files) throws IOException {
        List<String> paths = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);

            Files.write(path, file.getBytes());
            paths.add(filename);
        }

        return paths;
    }

    /**
     * Delete files from local storage
     */
    private ResponseGlobalDto<Boolean> deleteFilesLocally(List<String> fileNames) {
        try {
            for (String fileName : fileNames) {
                Path path = Paths.get(uploadDir + fileName);
                if (Files.exists(path)) {
                    Files.delete(path);
                }
            }
        } catch (Exception e) {
            log.error("Error deleting local files", e);
        }

        return ResponseGlobalDto.<Boolean>builder()
                .data(true)
                .build();
    }
}
