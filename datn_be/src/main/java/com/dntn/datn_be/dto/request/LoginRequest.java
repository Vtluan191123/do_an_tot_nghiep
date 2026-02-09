package com.dntn.datn_be.dto.request;

import lombok.Getter;
import org.springframework.stereotype.Service;

import jakarta.validation.constraints.NotBlank;

@Getter
@Service
public class LoginRequest {
    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Password không được để trống")
    private String password;
}
