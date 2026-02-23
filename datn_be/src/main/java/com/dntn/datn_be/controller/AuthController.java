package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.RegisterRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/auth/login")
    ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping("/auth/register")
    ResponseEntity<Users> register(@RequestBody @Valid RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }
}
