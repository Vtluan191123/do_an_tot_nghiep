package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.common.UserDetailCustom;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.dto.request.RegisterRequest;
import com.dntn.datn_be.dto.request.RefreshTokenRequest;
import com.dntn.datn_be.dto.response.LoginResponse;
import com.dntn.datn_be.exception.BaseAuthenticationException;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
                .roleId(request.getRoleId())
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(newUser);

        return ResponseEntity.ok(newUser);
    }

    @Override
    public Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long id = null;
        if(authentication.isAuthenticated()){
            UserDetailCustom userDetailCustom = (UserDetailCustom) authentication.getPrincipal();
            id = userDetailCustom.getId();
        }
        if(id == null){
            throw new BaseAuthenticationException("Token hết hạn hoặc không hợp lệ");
        }
        Optional<Users> userOtp = userRepository.findById(id);
        return userOtp.orElse(null);
    }

    @Override
    public ResponseEntity<LoginResponse> refreshToken(RefreshTokenRequest request) {
        try {
            // Validate refresh token
            if (!jwtService.validateToken(request.getRefreshToken())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(LoginResponse.builder()
                                .message("Invalid or expired refresh token")
                                .build());
            }

            // Get username from refresh token
            String username = jwtService.getUsername(request.getRefreshToken());

            // Get user from database
            Optional<Users> userOpt = userRepository.findUsersByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(LoginResponse.builder()
                                .message("User not found")
                                .build());
            }

            Users user = userOpt.get();

            // Generate new access token
            String newAccessToken = jwtService.generateToken(user, expirationAccess);

            return ResponseEntity.ok(LoginResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(request.getRefreshToken())
                    .build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .message("Token refresh failed: " + e.getMessage())
                            .build());
        }
    }

    @Override
    public ResponseEntity<ResponseGlobalDto<Object>> logout() {
        try {
            // Clear security context
            SecurityContextHolder.clearContext();

            return ResponseEntity.ok(ResponseGlobalDto.builder()
                    .message("Logged out successfully")
                    .code(HttpStatus.OK.value())
                    .status(HttpStatus.OK.value())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseGlobalDto.builder()
                            .message("Logout failed: " + e.getMessage())
                            .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                            .build());
        }
    }
}
