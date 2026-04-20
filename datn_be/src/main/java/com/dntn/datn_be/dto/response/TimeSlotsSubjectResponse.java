package com.dntn.datn_be.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimeSlotsSubjectResponse {
    private Long id;
    private Long subjectId;
    private Long timeSlotsId;
    private Long maxCapacity;
    private Long currentCapacity;
    private String trainingMethods;  // Online or Offline
    private Long coachId;
    private Long createdAt;
    private Long updatedAt;
    
    // TimeSlots information
    private LocalDate date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}

