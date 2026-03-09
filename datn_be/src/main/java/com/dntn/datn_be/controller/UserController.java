package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/user/")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("get")
    ResponseGlobalDto<List<Users>> gets(@RequestParam("userId") Long userId) throws IOException {
        return userService.gets(userId);
    }
}
