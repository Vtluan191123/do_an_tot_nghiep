package com.dntn.datn_be.exception;

import org.springframework.security.core.AuthenticationException;

public class BaseAuthenticationException extends AuthenticationException {
    public BaseAuthenticationException(String msg, Throwable cause) {
        super(msg, cause);
    }

    public BaseAuthenticationException(String msg) {
        super(msg);
    }
}
