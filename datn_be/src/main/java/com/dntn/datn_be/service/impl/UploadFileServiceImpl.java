package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.UploadFileService;
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
public class UploadFileServiceImpl implements UploadFileService {

    private final String uploadDir = "D:/uploads/";

    @Override
    public ResponseGlobalDto<List<String>> uploads(List<MultipartFile> files) throws IOException {
            List<String> paths = new ArrayList<>();

            for (MultipartFile file : files) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path path = Paths.get(uploadDir + filename);
                Files.write(path, file.getBytes());
                paths.add(filename);
            }
            return ResponseGlobalDto.<List<String>>builder()
                    .data(paths)
                    .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(List<String> fileNames) throws IOException {
        try {
            for(String fileName : fileNames){
                Path path = Paths.get(uploadDir + fileName);
                if(Files.exists(path)){
                    Files.delete(path);
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        return ResponseGlobalDto.<Boolean>builder()
                .data(true)
                .build();
    }
}
