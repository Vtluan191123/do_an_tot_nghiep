package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiSessionHistoryCreateRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryFilterRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryUpdateRequest;
import com.dntn.datn_be.dto.response.AiSessionHistoryResponseDTO;
import com.dntn.datn_be.model.AiSessionHistory;

import java.util.List;

public interface AiSessionHistoryService {

    /**
     * Create a new AI session history
     */
    ResponseGlobalDto<AiSessionHistoryResponseDTO> create(AiSessionHistoryCreateRequest request);

    /**
     * Get session by session_id
     */
    ResponseGlobalDto<AiSessionHistoryResponseDTO> getBySessionId(String sessionId);

    /**
     * Get all sessions by user_id
     */
    ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getByUserId(Long userId);

    /**
     * Search sessions with filter and pagination
     */
    ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> search(AiSessionHistoryFilterRequest request);

    /**
     * Update session history
     */
    ResponseGlobalDto<AiSessionHistoryResponseDTO> update(AiSessionHistoryUpdateRequest request);

    /**
     * Delete session by id
     */
    ResponseGlobalDto<Boolean> delete(Long id);

    /**
     * Delete multiple sessions
     */
    ResponseGlobalDto<Boolean> deleteMultiple(List<Long> ids);

    /**
     * Get active sessions by user_id
     */
    ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getActiveSessions(Long userId);
}

