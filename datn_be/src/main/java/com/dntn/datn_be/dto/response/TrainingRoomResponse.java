package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRoomResponse {
    
    private Long id;
    
    private Long timeSlotsSubjectId;
    
    private Long coachId;
    
    private Long subjectId;
    
    private String name;
    
    private String description;
    
    private Long capacity;
    
    private String zoomLink;
    
    private String status;
    
    private Long currentParticipants;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

