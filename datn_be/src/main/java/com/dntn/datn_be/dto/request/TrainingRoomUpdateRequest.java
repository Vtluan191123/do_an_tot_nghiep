package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRoomUpdateRequest {
    
    private Long id;
    
    private String name;
    
    private String description;
    
    private Long maxCapacity;
    
    private Long currentCapacity;
    
    private String zoomLink;
    
    private String status;
}

