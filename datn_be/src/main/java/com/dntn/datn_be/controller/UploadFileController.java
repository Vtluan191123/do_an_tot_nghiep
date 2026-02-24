package com.dntn.datn_be.controller;

import com.dntn.datn_be.service.UploadFileService;
import lombok.RequiredArgsConstructor;
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

        this.uploadFileService.uploads(files);

        return ResponseEntity.ok("OK");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFiles(@RequestParam("files") List<String> fileNames) throws IOException {

        this.uploadFileService.delete(fileNames);

        return ResponseEntity.ok("OK");
    }
}
