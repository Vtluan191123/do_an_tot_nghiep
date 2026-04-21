package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectUpdateRequest;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.dto.response.TimeSlotsSubjectResponse;
import com.dntn.datn_be.dto.response.CoachWeeklyScheduleResponse;
import com.dntn.datn_be.model.TimeSlotsSubject;

import java.util.List;

public interface TimeSlotsSubjectService {
    /**
     * Get all time slots for a subject
     */
    ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getBySubjectId(Long subjectId);
    
    /**
     * Get all time slots for a coach
     */
    ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachId(Long coachId);
    
    /**
     * Get all time slots for a specific coach and subject
     */
    ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachIdAndSubjectId(Long coachId, Long subjectId);
    
    /**
     * Get a specific time slot by ID
     */
    ResponseGlobalDto<TimeSlotsSubjectResponse> getById(Long id);
    
    /**
     * Update a time slot (maxCapacity, trainingMethod)
     */
    ResponseGlobalDto<TimeSlotsSubjectResponse> update(TimeSlotsSubjectUpdateRequest request);
    
    /**
     * Create time slots for a coach and subject from existing TimeSlots
     */
    ResponseGlobalDto<List<TimeSlotsSubjectResponse>> createForCoachAndSubject(Long coachId, Long subjectId);
    
    /**
     * Create a single time slot for coach and subject with specific details
     */
    ResponseGlobalDto<TimeSlotsSubjectResponse> createSingleTimeSlot(Long coachId, Long subjectId, Long timeSlotId, Long maxCapacity, String trainingMethods);
    
    /**
     * Delete time slots for a coach
     */
    ResponseGlobalDto<Boolean> deleteByCoachId(Long coachId);
    
    /**
     * Delete time slots for a subject
     */
    ResponseGlobalDto<Boolean> deleteBySubjectId(Long subjectId);
    
    /**
     * Get coach's weekly schedule with pagination
     * @param coachId Coach ID
     * @param weekNumber Week number (0 = current week, 1 = next week, -1 = previous week, etc.)
     * @return Weekly schedule organized by day with pagination info
     */
    ResponseGlobalDto<CoachWeeklyScheduleResponse> getCoachWeeklySchedule(Long coachId, Integer weekNumber);
    
    /**
     * Get time slots for coach with pagination and filtering
     * @param request Filter request with pagination info
     * @return Paginated list of time slots
     */
    ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getCoachTimeSlotsWithPagination(TimeSlotsSubjectFilterRequest request);
}
