package com.dntn.datn_be.constants;

public final class AuthConstants {

    // Public endpoints (no authentication required)
    // NOTE: If booking should require authentication, remove "/api/booking/**" and ensure FE sends JWT.
    public static final String[] URL_PUBLIC = {"/api/auth/**","/uploads/**","/api/ai/**","/api/message/**","/api/payment/**","/api/booking/**"};
    public static final String[] URL_USER = {"/api/auth/**","/uploads/**","/api/ai/**"};
    public static final String[] URL_COMBO = {"/api/auth/**","/uploads/**","/api/ai/**"};
    public static final String[] URL_ZOOM = {"/api/auth/**","/uploads/**","/api/ai/**"};
    public static final String[] URL_BOOKING = {"/api/auth/**","/uploads/**","/api/ai/**"};
    public static final String[] URL_SUB = {"/api/auth/**","/uploads/**","/api/ai/**"};
}
