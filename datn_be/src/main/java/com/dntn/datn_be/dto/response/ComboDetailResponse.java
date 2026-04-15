package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ComboDetailResponse {
    
    private Long id;
    
    private String code;
    
    private String name;
    
    private String description;
    
    private BigDecimal prices;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private List<ComboSubjectDetail> comboSubjects;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComboSubjectDetail {
        private Long subjectId;
        private Integer totalTeach;
    }
}


