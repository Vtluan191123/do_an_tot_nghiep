package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

public interface UploadFileService {
    ResponseGlobalDto<List<String>> uploads(List<MultipartFile> files) throws IOException;
    ResponseGlobalDto<Boolean> delete(List<String> fileNames) throws IOException;
}
