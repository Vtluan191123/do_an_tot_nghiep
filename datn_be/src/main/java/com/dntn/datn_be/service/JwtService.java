package com.dntn.datn_be.service;

import com.dntn.datn_be.model.Users;
import io.jsonwebtoken.Claims;

import java.util.List;

public interface JwtService {
    String generateToken(Users user ,long expiration);
    Claims getClaims(String token);
    boolean validateToken(String token);
    String getUsername(String token);
    String getRole(String token);
    List<String> getAuthorities(String token);
}
