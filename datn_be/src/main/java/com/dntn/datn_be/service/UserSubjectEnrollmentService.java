package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.UserEnrolledSubjectDetailResponse;
import com.dntn.datn_be.dto.response.UserScheduledTimeSlotResponse;

import java.util.List;

public interface UserSubjectEnrollmentService {
    /**
     * Get all subjects enrolled by a user
     * @param userId User ID
     * @return List of enrolled subjects with details
     */
    ResponseGlobalDto<List<UserEnrolledSubjectDetailResponse>> getUserEnrolledSubjects(Long userId);

    /**
     * Get all scheduled time slots for a user's subjects
     * @param userId User ID
     * @return List of scheduled time slots
     */
    ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlots(Long userId);

    /**
     * Get scheduled time slots for a specific subject
     * @param userId User ID
     * @param subjectId Subject ID
     * @return List of scheduled time slots for that subject
     */
    ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlotsForSubject(Long userId, Long subjectId);
}

