package com.dntn.datn_be.service;

import com.dntn.datn_be.model.Users;
import io.jsonwebtoken.Claims;

public interface JwtService {
    String generateToken(Users user ,long expiration);
    Claims getClaims(String token);
    boolean validateToken(String token);
    String getUsername(String token);
}
