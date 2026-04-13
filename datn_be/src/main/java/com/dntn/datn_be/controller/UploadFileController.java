package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.UploadFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class UploadFileController {

    private final UploadFileService uploadFileService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(@RequestParam("files") List<MultipartFile> files) throws IOException {
        List<String> uploadedFileUrls = this.uploadFileService.uploads(files);

        return ResponseEntity.ok(
                ResponseGlobalDto.builder()
                        .status(HttpStatus.OK.value())
                        .data(uploadedFileUrls)
                        .message("Files uploaded successfully")
                        .build()
        );
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFiles(@RequestParam("files") List<String> fileNames) throws IOException {
        boolean result = this.uploadFileService.delete(fileNames).getData();

        return ResponseEntity.ok(
                ResponseGlobalDto.builder()
                        .status(result ? HttpStatus.OK.value() : HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .data(result)
                        .message(result ? "Files deleted successfully" : "Failed to delete some files")
                        .build()
        );
    }
}
