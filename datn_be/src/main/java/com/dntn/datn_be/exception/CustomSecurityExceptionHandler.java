package com.dntn.datn_be.exception;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomSecurityExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {
    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest req,
                         HttpServletResponse res,
                         AuthenticationException e) throws IOException {

        res.setContentType("application/json");
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ResponseGlobalDto<String> response = ResponseGlobalDto.<String>builder()
                .status(HttpServletResponse.SC_UNAUTHORIZED)
                .error("Unauthorized")
                .build();
        res.getWriter().write(objectMapper.writeValueAsString(response));
    }

    @Override
    public void handle(HttpServletRequest req,
                       HttpServletResponse res,
                       AccessDeniedException e) throws IOException {

        res.setContentType("application/json");
        res.setStatus(403);
        ResponseGlobalDto<String> response = ResponseGlobalDto.<String>builder()
                .status(HttpServletResponse.SC_FORBIDDEN)
                .error("Forbidden")
                .build();
        res.getWriter().write(objectMapper.writeValueAsString(response));
    }
}
