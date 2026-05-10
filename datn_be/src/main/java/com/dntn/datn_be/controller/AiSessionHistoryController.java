package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiSessionHistoryCreateRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryFilterRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryUpdateRequest;
import com.dntn.datn_be.dto.response.AiSessionHistoryResponseDTO;
import com.dntn.datn_be.service.AiSessionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-session")
@RequiredArgsConstructor
public class AiSessionHistoryController {

    private final AiSessionHistoryService aiSessionHistoryService;

    /**
     * Create a new AI session history
     */
    @PostMapping("/create")
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> create(
            @RequestBody AiSessionHistoryCreateRequest request) {
        return aiSessionHistoryService.create(request);
    }

    /**
     * Get session by session_id
     */
    @GetMapping("/by-session-id/{sessionId}")
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> getBySessionId(
            @PathVariable String sessionId) {
        return aiSessionHistoryService.getBySessionId(sessionId);
    }

    /**
     * Get all sessions by user_id
     */
    @GetMapping("/by-user/{userId}")
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getByUserId(
            @PathVariable Long userId) {
        return aiSessionHistoryService.getByUserId(userId);
    }

    /**
     * Get active sessions by user_id
     */
    @GetMapping("/active/{userId}")
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getActiveSessions(
            @PathVariable Long userId) {
        return aiSessionHistoryService.getActiveSessions(userId);
    }

    /**
     * Search sessions with filter and pagination
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> search(
            @RequestBody AiSessionHistoryFilterRequest request) {
        return aiSessionHistoryService.search(request);
    }

    /**
     * Update session history
     */
    @PutMapping("/update")
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> update(
            @RequestBody AiSessionHistoryUpdateRequest request) {
        return aiSessionHistoryService.update(request);
    }

    /**
     * Delete session by id
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) {
        return aiSessionHistoryService.delete(id);
    }

    /**
     * Delete multiple sessions
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deleteMultiple(@RequestBody List<Long> ids) {
        return aiSessionHistoryService.deleteMultiple(ids);
    }
}

