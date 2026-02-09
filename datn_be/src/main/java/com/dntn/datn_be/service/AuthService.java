package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.RegisterRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.model.Roles;
import com.dntn.datn_be.model.Users;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<LoginResponse> login(LoginRequest request);
    ResponseEntity<Users> register(RegisterRequest request);
}
