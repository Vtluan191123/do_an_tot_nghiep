package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.UserEnrolledSubjectDetailResponse;
import com.dntn.datn_be.dto.response.UserScheduledTimeSlotResponse;
import com.dntn.datn_be.service.UserSubjectEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-enrollment")
@RequiredArgsConstructor
public class UserSubjectEnrollmentController {
    
    private final UserSubjectEnrollmentService userSubjectEnrollmentService;
    
    /**
     * Get all subjects enrolled by user
     * @param userId User ID
     * @return List of enrolled subjects with details
     */
    @GetMapping("/{userId}/subjects")
    public ResponseGlobalDto<List<UserEnrolledSubjectDetailResponse>> getUserEnrolledSubjects(@PathVariable Long userId) {
        return userSubjectEnrollmentService.getUserEnrolledSubjects(userId);
    }
    
    /**
     * Get all scheduled time slots for user
     * @param userId User ID
     * @return List of all scheduled time slots
     */
    @GetMapping("/{userId}/scheduled-time-slots")
    public ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlots(@PathVariable Long userId) {
        return userSubjectEnrollmentService.getUserScheduledTimeSlots(userId);
    }
    
    /**
     * Get scheduled time slots for specific subject
     * @param userId User ID
     * @param subjectId Subject ID
     * @return List of scheduled time slots for that subject
     */
    @GetMapping("/{userId}/subjects/{subjectId}/time-slots")
    public ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlotsForSubject(
            @PathVariable Long userId, 
            @PathVariable Long subjectId) {
        return userSubjectEnrollmentService.getUserScheduledTimeSlotsForSubject(userId, subjectId);
    }
}

