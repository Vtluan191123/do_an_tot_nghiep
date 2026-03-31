package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.RoleRepository;
import com.dntn.datn_be.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    @Value("${spring.jwt.secret}")
    private String secretKey;
    private SecretKey key;

    private final RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secretKey)
        );
    }

    @Override
    public String generateToken(Users user ,long expiration) {
        String roleCode = this.roleRepository.getCodeById(user.getRoleId());
        List<String> authoritiesCode = this.roleRepository.getCodeAuthoritiesById(user.getRoleId());


        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", roleCode)
                .claim("authorities", authoritiesCode)
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    @Override
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    @Override
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    @Override
    public List<String> getAuthorities(String token) {
        Object authorities = getClaims(token).get("authorities");

        if (authorities instanceof List<?>) {
            return ((List<?>) authorities)
                    .stream()
                    .map(Object::toString)
                    .toList();
        }

        return List.of();
    }
}
