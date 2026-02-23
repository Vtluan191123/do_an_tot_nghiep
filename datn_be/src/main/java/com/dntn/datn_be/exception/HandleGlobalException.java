package com.dntn.datn_be.exception;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.*;

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


    //handle exception input field
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseGlobalDto<String>> handleFieldInputException(MethodArgumentNotValidException e) {

        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        Map<String,String> errorMessages = new HashMap<>();
        for (FieldError fieldError : fieldErrors) {
            errorMessages.put(fieldError.getField(),fieldError.getDefaultMessage());
        }

        ResponseGlobalDto<String> responseGlobalDto = ResponseGlobalDto.<String>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errorMessages)
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseGlobalDto);
    }

    //handle exception credentials
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseGlobalDto<String>> handleCredentialsException(MethodArgumentNotValidException e) {

        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        Map<String,String> errorMessages = new HashMap<>();
        for (FieldError fieldError : fieldErrors) {
            errorMessages.put(fieldError.getField(),fieldError.getDefaultMessage());
        }

        ResponseGlobalDto<String> responseGlobalDto = ResponseGlobalDto.<String>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errorMessages)
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseGlobalDto);
    }
}
