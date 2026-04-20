package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRoomCreateRequest {
    
    private Long timeSlotsSubjectId;
    
    private Long coachId;
    
    private Long subjectId;
    
    private String name;
    
    private String description;
    
    private Long capacity;
    
    private String zoomLink;
    
    private String status;
}

