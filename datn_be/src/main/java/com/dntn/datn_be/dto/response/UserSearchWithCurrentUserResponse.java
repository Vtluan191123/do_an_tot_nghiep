package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Response DTO for /api/user/search endpoint
 * Includes current user information along with search results
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserSearchWithCurrentUserResponse {
    /**
     * Current authenticated user information
     */
    private UserResponse currentUser;
    
    /**
     * List of search results
     */
    private List<UserResponse> users;
}

