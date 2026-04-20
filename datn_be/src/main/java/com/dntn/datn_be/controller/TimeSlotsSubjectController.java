package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectUpdateRequest;
import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.dto.response.TimeSlotsSubjectResponse;
import com.dntn.datn_be.service.TimeSlotsSubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-slots-subject")
@RequiredArgsConstructor
public class TimeSlotsSubjectController {
    
    private final TimeSlotsSubjectService timeSlotsSubjectService;
    
    /**
     * Get all time slots for a subject
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getBySubjectId(@PathVariable Long subjectId) {
        return timeSlotsSubjectService.getBySubjectId(subjectId);
    }
    
    /**
     * Get all time slots for a coach
     */
    @GetMapping("/coach/{coachId}")
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachId(@PathVariable Long coachId) {
        return timeSlotsSubjectService.getByCoachId(coachId);
    }
    
    /**
     * Get time slots for a specific coach and subject
     */
    @GetMapping("/coach/{coachId}/subject/{subjectId}")
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getByCoachIdAndSubjectId(
            @PathVariable Long coachId,
            @PathVariable Long subjectId) {
        return timeSlotsSubjectService.getByCoachIdAndSubjectId(coachId, subjectId);
    }
    
    /**
     * Get a specific time slot by ID
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<TimeSlotsSubjectResponse> getById(@PathVariable Long id) {
        return timeSlotsSubjectService.getById(id);
    }
    
    /**
     * Update a time slot (maxCapacity, trainingMethod)
     */
    @PutMapping
    public ResponseGlobalDto<TimeSlotsSubjectResponse> update(@RequestBody TimeSlotsSubjectUpdateRequest request) {
        return timeSlotsSubjectService.update(request);
    }
    
    /**
     * Create time slots for a coach and subject
     */
    @PostMapping("/coach/{coachId}/subject/{subjectId}")
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> createForCoachAndSubject(
            @PathVariable Long coachId,
            @PathVariable Long subjectId) {
        return timeSlotsSubjectService.createForCoachAndSubject(coachId, subjectId);
    }
    
    /**
     * Delete time slots for a coach
     */
    @DeleteMapping("/coach/{coachId}")
    public ResponseGlobalDto<Boolean> deleteByCoachId(@PathVariable Long coachId) {
        return timeSlotsSubjectService.deleteByCoachId(coachId);
    }
    
    /**
     * Delete time slots for a subject
     */
    @DeleteMapping("/subject/{subjectId}")
    public ResponseGlobalDto<Boolean> deleteBySubjectId(@PathVariable Long subjectId) {
        return timeSlotsSubjectService.deleteBySubjectId(subjectId);
    }
    
    /**
     * Get coach's weekly schedule with pagination
     * Groups time slots by day of week for the specified week
     */
    @GetMapping("/coach/{coachId}/weekly")
    public ResponseGlobalDto<?> getCoachWeeklySchedule(
            @PathVariable Long coachId,
            @RequestParam(defaultValue = "0") Integer weekNumber) {
        return timeSlotsSubjectService.getCoachWeeklySchedule(coachId, weekNumber);
    }
    
    /**
     * Get coach time slots with pagination and filtering
     */
    @PostMapping("/coach/filter")
    public ResponseGlobalDto<List<TimeSlotsSubjectResponse>> getCoachTimeSlotsWithFilter(
            @RequestBody TimeSlotsSubjectFilterRequest request) {
        return timeSlotsSubjectService.getCoachTimeSlotsWithPagination(request);
    }
}


