package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.common.UserDetailCustom;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.RegisterRequest;
import com.dntn.datn_be.dto.request.RefreshTokenRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping("/register")
    ResponseEntity<Users> register(@RequestBody @Valid RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @GetMapping("/profile")
    ResponseEntity<Users> getInfo(@AuthenticationPrincipal UserDetailCustom user) {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/refresh")
    ResponseEntity<LoginResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }

    @PostMapping("/logout")
    ResponseEntity<ResponseGlobalDto<Object>> logout() {
        return authService.logout();
    }
}

