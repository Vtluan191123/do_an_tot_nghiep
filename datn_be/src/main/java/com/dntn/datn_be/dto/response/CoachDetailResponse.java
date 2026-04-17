package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * CoachDetailResponse
 * Dùng để trả về thông tin chi tiết của coach cùng với danh sách môn học mà coach dạy
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CoachDetailResponse {
    
    private Long id;
    
    private String username;
    
    private String fullName;
    
    private String email;
    
    private String age;
    
    private String description;
    
    private String address;
    
    private String exp;
    
    private String phoneNumber;
    
    private String imagesUrl;
    
    private Long voteStar;
    
    private Long roleId;
    
    // Danh sách môn học mà coach dạy
    private List<SubjectDetailResponse> subjects;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubjectDetailResponse {
        private Long id;
        private String name;
        private String description;
        private String images;
        private String status;
    }
}

