package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.MessageRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/message/")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping("send")
    ResponseGlobalDto<BaseMongoMessage> send(@RequestPart("message") @Valid MessageRequest request,
                                             @RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {
        request.getMessageDetailRequest().setFiles(files);
        return messageService.create(request);
    }

    @PutMapping("update")
    ResponseGlobalDto<BaseMongoMessage> update(@RequestBody @Valid MessageRequest request) throws IOException {
        return messageService.update(request);
    }

    @GetMapping("gets")
    ResponseGlobalDto<List<BaseMongoMessage>> gets(@RequestParam("groudId") String request) throws IOException {
        return messageService.gets(request);
    }

    @DeleteMapping("delete")
    ResponseGlobalDto<Boolean> delete(@RequestParam("messageId") String request) throws Exception {
        return messageService.delete(request);
    }
}
