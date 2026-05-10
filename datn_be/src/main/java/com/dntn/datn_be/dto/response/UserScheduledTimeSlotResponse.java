package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserScheduledTimeSlotResponse {
    private Long id;
    private Long timeSlotSubjectId;
    private Long subjectId;
    private String subjectName;
    private LocalDate scheduleDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String trainingMethod;  // Online or Offline
    private String coachName;
    private Long coachId;
    private Long maxCapacity;
    private Long currentCapacity;
    private Integer bookingStatus;  // 0: pending, 1: confirmed, 2: completed, etc.
    private LocalDateTime bookingDate;
}

