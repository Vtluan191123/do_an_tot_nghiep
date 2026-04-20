package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.TrainingRoomCreateRequest;
import com.dntn.datn_be.dto.request.TrainingRoomFilterRequest;
import com.dntn.datn_be.dto.request.TrainingRoomUpdateRequest;
import com.dntn.datn_be.dto.response.TrainingRoomResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TrainingRoomService {
    
    /**
     * Get all training rooms
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getAll();
    
    /**
     * Get training room by ID
     */
    ResponseGlobalDto<TrainingRoomResponse> getById(Long id);
    
    /**
     * Get training room by timeSlots subject ID
     */
    ResponseGlobalDto<TrainingRoomResponse> getByTimeSlotsSubjectId(Long timeSlotsSubjectId);
    
    /**
     * Get all training rooms for a coach
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getByCoachId(Long coachId);
    
    /**
     * Get all active training rooms for a coach
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getActiveByCoachId(Long coachId);
    
    /**
     * Get all training rooms for a subject
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getBySubjectId(Long subjectId);
    
    /**
     * Get training rooms by status
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getByStatus(String status);
    
    /**
     * Search and filter training rooms with pagination
     */
    ResponseGlobalDto<Page<TrainingRoomResponse>> search(TrainingRoomFilterRequest request);
    
    /**
     * Get online training rooms for a user based on their enrolled subjects
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUser(Long userId);
    
    /**
     * Get online training rooms for a user with pagination
     */
    ResponseGlobalDto<Page<TrainingRoomResponse>> getOnlineRoomsForUser(Long userId, Integer page, Integer size);
    
    /**
     * Get online training rooms for a user by specific subject
     */
    ResponseGlobalDto<List<TrainingRoomResponse>> getOnlineRoomsForUserBySubject(Long userId, Long subjectId);
    
    /**
     * Create a new training room
     */
    ResponseGlobalDto<TrainingRoomResponse> create(TrainingRoomCreateRequest request);
    
    /**
     * Create training room for a timeSlot subject (auto-generation)
     */
    ResponseGlobalDto<TrainingRoomResponse> createForTimeSlotsSubject(Long timeSlotsSubjectId);
    
    /**
     * Update training room
     */
    ResponseGlobalDto<TrainingRoomResponse> update(TrainingRoomUpdateRequest request);
    
    /**
     * Delete training room
     */
    ResponseGlobalDto<Boolean> delete(Long id);
    
    /**
     * Delete all training rooms for a coach
     */
    ResponseGlobalDto<Boolean> deleteByCoachId(Long coachId);
}

