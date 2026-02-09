package com.dntn.datn_be.exception;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class HandleGlobalException {


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseGlobalDto<String>> handleException(Exception e) {
        ResponseGlobalDto<String> responseGlobalDto = ResponseGlobalDto.<String>builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(e.getMessage())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseGlobalDto);
    }
}
