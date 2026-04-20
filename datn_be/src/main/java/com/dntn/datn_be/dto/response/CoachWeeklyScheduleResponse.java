package com.dntn.datn_be.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for coach's weekly schedule with pagination
 * Groups time slots by week and displays all time slots for that week
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoachWeeklyScheduleResponse {
    
    // Week information
    private Integer weekNumber;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    
    // Organized by day of week
    // Key: day of week (Monday, Tuesday, ..., Sunday)
    // Value: list of time slots for that day
    private Map<String, List<DayTimeSlotResponse>> dailySchedule;
    
    // Pagination info
    private Integer currentPage;
    private Integer totalWeeks;
    
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DayTimeSlotResponse {
        private Long timeSlotsId;
        private LocalDate date;
        private String startTime;
        private String endTime;
        
        // Time slot subject details
        private Long timeSlotsSubjectId;
        private Long subjectId;
        private Long maxCapacity;
        private Long currentCapacity;
        private String trainingMethods;
        private Long coachId;
    }
}

