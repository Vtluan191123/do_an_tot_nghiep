package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.RegisterRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${spring.jwt.expiration_access}")
    private Long expirationAccess;

    @Value("${spring.jwt.expiration_refresh}")
    private Long expirationRefresh;

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest request) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        authenticationManager.authenticate(token);

        LoginResponse response = handleCreateToken(request.getUsername());

        return ResponseEntity.ok(response);
    }

    private LoginResponse handleCreateToken(String userName){
        Optional<Users> userOtp = userRepository.findUsersByUsername(userName);
        if(userOtp.isEmpty()){
            throw new UsernameNotFoundException("User not found");
        }
        Users user = userOtp.get();
        return LoginResponse.builder()
                .accessToken(jwtService.generateToken(user, expirationAccess))
                .refreshToken(jwtService.generateToken(user, expirationRefresh))
                .build();
    }

    @Override
    public ResponseEntity<Users> register(RegisterRequest request) {

        Users newUser = Users.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .age(request.getAge())
                .email(request.getEmail())
                .roles(Set.of())
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(newUser);

        return ResponseEntity.ok(newUser);
    }


}
