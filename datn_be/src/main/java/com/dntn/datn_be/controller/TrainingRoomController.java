package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TrainingRoomCreateRequest;
import com.dntn.datn_be.dto.request.TrainingRoomFilterRequest;
import com.dntn.datn_be.dto.request.TrainingRoomUpdateRequest;
import com.dntn.datn_be.dto.response.TrainingRoomResponse;
import com.dntn.datn_be.service.TrainingRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-room")
@RequiredArgsConstructor
public class TrainingRoomController {
    
    private final TrainingRoomService trainingRoomService;
    
    /**
     * Get all training rooms
     */
    @GetMapping
    public ResponseGlobalDto<List<TrainingRoomResponse>> getAll() {
        return trainingRoomService.getAll();
    }
    
    /**
     * Get training room by ID
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<TrainingRoomResponse> getById(@PathVariable Long id) {
        return trainingRoomService.getById(id);
    }
    
    /**
     * Get training room by timeSlots subject ID
     */
    @GetMapping("/timeslots-subject/{timeSlotsSubjectId}")
    public ResponseGlobalDto<TrainingRoomResponse> getByTimeSlotsSubjectId(
            @PathVariable Long timeSlotsSubjectId) {
        return trainingRoomService.getByTimeSlotsSubjectId(timeSlotsSubjectId);
    }
    
    /**
     * Get all training rooms for a coach
     */
    @GetMapping("/coach/{coachId}")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getByCoachId(@PathVariable Long coachId) {
        return trainingRoomService.getByCoachId(coachId);
    }
    
    /**
     * Get all active training rooms for a coach
     */
    @GetMapping("/coach/{coachId}/active")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getActiveByCoachId(@PathVariable Long coachId) {
        return trainingRoomService.getActiveByCoachId(coachId);
    }
    
    /**
     * Get all training rooms for a subject
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getBySubjectId(@PathVariable Long subjectId) {
        return trainingRoomService.getBySubjectId(subjectId);
    }
    
    /**
     * Get training rooms by status
     */
    @GetMapping("/status/{status}")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getByStatus(@PathVariable String status) {
        return trainingRoomService.getByStatus(status);
    }
    
    /**
     * Search and filter training rooms with pagination
     */
    @PostMapping("/search")
    public ResponseGlobalDto<Page<TrainingRoomResponse>> search(
            @RequestBody TrainingRoomFilterRequest request) {
        return trainingRoomService.search(request);
    }
    
    /**
     * Get online training rooms for a user based on their enrolled subjects
     */
    @GetMapping("/user/{userId}")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUser(
            @PathVariable Long userId) {
        return trainingRoomService.getOnlineRoomsForUser(userId);
    }
    
    /**
     * Get online training rooms for a user with pagination
     */
    @GetMapping("/user/{userId}/paginated")
    public ResponseGlobalDto<Page<TrainingRoomResponse>> getOnlineRoomsForUserPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return trainingRoomService.getOnlineRoomsForUser(userId, page, size);
    }
    
    /**
     * Get online training rooms for a user by specific subject
     */
    @GetMapping("/user/{userId}/subject/{subjectId}")
    public ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUserBySubject(
            @PathVariable Long userId,
            @PathVariable Long subjectId) {
        return trainingRoomService.getOnlineRoomsForUserBySubject(userId, subjectId);
    }
    
    /**
     * Create a new training room
     */
    @PostMapping
    public ResponseGlobalDto<TrainingRoomResponse> create(
            @RequestBody TrainingRoomCreateRequest request) {
        return trainingRoomService.create(request);
    }
    
    /**
     * Create training room for a timeSlot subject (auto-generation)
     */
    @PostMapping("/timeslots-subject/{timeSlotsSubjectId}")
    public ResponseGlobalDto<TrainingRoomResponse> createForTimeSlotsSubject(
            @PathVariable Long timeSlotsSubjectId) {
        return trainingRoomService.createForTimeSlotsSubject(timeSlotsSubjectId);
    }
    
    /**
     * Update training room
     */
    @PutMapping
    public ResponseGlobalDto<TrainingRoomResponse> update(
            @RequestBody TrainingRoomUpdateRequest request) {
        return trainingRoomService.update(request);
    }
    
    /**
     * Delete training room
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) {
        return trainingRoomService.delete(id);
    }
    
    /**
     * Delete all training rooms for a coach
     */
    @DeleteMapping("/coach/{coachId}")
    public ResponseGlobalDto<Boolean> deleteByCoachId(@PathVariable Long coachId) {
        return trainingRoomService.deleteByCoachId(coachId);
    }
}

