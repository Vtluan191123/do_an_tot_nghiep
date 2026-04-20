package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRoomFilterRequest {
    
    private Long coachId;
    
    private Long subjectId;
    
    private String status;
    
    private String keyword;
    
    private Integer page;
    
    private Integer size;
    
    private String sortBy;
    
    private String sortDirection;
}

