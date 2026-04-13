package com.dntn.datn_be.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CloudStorageService {
    /**
     * Upload multiple files to cloud storage
     * @param files List of files to upload
     * @return List of file URLs
     */
    List<String> uploadFiles(List<MultipartFile> files) throws IOException;

    /**
     * Delete multiple files from cloud storage
     * @param fileUrls List of file URLs to delete
     * @return true if all files deleted successfully
     */
    boolean deleteFiles(List<String> fileUrls);

    /**
     * Get public URL of uploaded file
     * @param fileName File name
     * @return Public URL
     */
    String getFileUrl(String fileName);
}

