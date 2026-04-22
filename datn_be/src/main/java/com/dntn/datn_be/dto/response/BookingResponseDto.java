package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {
    
    private Long id;
    
    private Long userId;
    
    private String userName;
    
    private Long subjectId;
    
    private String subjectName;
    
    private Long timeSlotSubjectId;
    
    private LocalDateTime timeSlotStart;

    private LocalDateTime timeSlotEnd;

    private Long maxCapacity;

    private Long currentCapacity;

    private Integer status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

