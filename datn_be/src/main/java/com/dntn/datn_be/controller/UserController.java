package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/user/")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ================== CREATE ==================
    @PostMapping
    public ResponseGlobalDto<UserResponse> create(@RequestBody UserCreateRequest request) throws IOException {
        return userService.create(request);
    }

    // ================== GET LIST ==================
    @PostMapping("/search")
    public ResponseGlobalDto<List<UserResponse>> gets(@RequestBody UserFilterRequest request) throws IOException {
        return userService.gets(request);
    }

    // ================== GET BY ID ==================
    @GetMapping("/{id}")
    public ResponseGlobalDto<UserResponse> get(@PathVariable Long id) {
        UserFilterRequest request = new UserFilterRequest();
        request.setId(id);
        return userService.get(request);
    }

    // ================== UPDATE ==================
    @PutMapping
    public ResponseGlobalDto<UserResponse> update(@RequestBody UserUpdateRequest request) {
        return userService.update(request);
    }

    // ================== DELETE ONE ==================
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return userService.delete(id);
    }

    // ================== DELETE MULTI ==================
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return userService.deletes(ids);
    }
}
