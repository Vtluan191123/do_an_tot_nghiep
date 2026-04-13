package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.service.CloudStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalOceanSpacesService implements CloudStorageService {

    private final S3Client s3Client;

    @Value("${spring.digitalocean.spaces.bucket}")
    private String bucketName;

    @Value("${spring.digitalocean.spaces.endpoint}")
    private String endpoint;

    @Value("${spring.digitalocean.spaces.region}")
    private String region;

    @Override
    public List<String> uploadFiles(List<MultipartFile> files) throws IOException {
        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                String ext = "";

                String original = file.getOriginalFilename();
                if (original != null && original.contains(".")) {
                    ext = original.substring(original.lastIndexOf("."));
                }

                String fileName = UUID.randomUUID() + "_" + ext;
                byte[] fileContent = file.getBytes();

                log.debug("Uploading file: {} to bucket: {} with size: {} bytes",
                        fileName, bucketName, fileContent.length);

                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                        .acl("public-read")
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileContent));

                String fileUrl = getFileUrl(fileName);
                uploadedUrls.add(fileUrl);
                log.info("File uploaded successfully: {} → {}", fileName, fileUrl);

            } catch (Exception e) {
                log.error("Error uploading file: {} - Error: {}", file.getOriginalFilename(), e.getMessage(), e);
                throw new IOException("Failed to upload file: " + file.getOriginalFilename() + " - " + e.getMessage(), e);
            }
        }

        return uploadedUrls;
    }

    @Override
    public boolean deleteFiles(List<String> fileUrls) {
        boolean allDeleted = true;

        for (String fileUrl : fileUrls) {
            try {
                String fileName = extractFileNameFromUrl(fileUrl);
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .build();

                s3Client.deleteObject(deleteObjectRequest);
                log.info("File deleted successfully: {}", fileName);

            } catch (NoSuchKeyException e) {
                log.warn("File not found in storage: {}", fileUrl);
            } catch (Exception e) {
                log.error("Error deleting file: {}", fileUrl, e);
                allDeleted = false;
            }
        }

        return allDeleted;
    }

    @Override
    public String getFileUrl(String fileName) {
        // Format: https://bucket.region.cdn.digitaloceanspaces.com/filename
        return endpoint.replaceAll("/$", "") + "/" + fileName;
    }

    /**
     * Extract file name from full URL
     */
    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return fileUrl;
        }
        // Extract just the filename from the URL
        String[] parts = fileUrl.split("/");
        return parts[parts.length - 1];
    }
}

