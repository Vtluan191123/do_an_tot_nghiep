package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiSessionHistoryCreateRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryFilterRequest;
import com.dntn.datn_be.dto.request.AiSessionHistoryUpdateRequest;
import com.dntn.datn_be.dto.response.AiSessionHistoryResponseDTO;
import com.dntn.datn_be.model.AiSessionHistory;
import com.dntn.datn_be.repository.AiSessionHistoryRepository;
import com.dntn.datn_be.service.AiSessionHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiSessionHistoryServiceImpl implements AiSessionHistoryService {

    private static final Logger log = LoggerFactory.getLogger(AiSessionHistoryServiceImpl.class);
    private final AiSessionHistoryRepository aiSessionHistoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> create(AiSessionHistoryCreateRequest request) {
        try {
            String metadata = objectMapper.writeValueAsString(request.getMetadata());

            AiSessionHistory sessionHistory = AiSessionHistory.builder()
                    .userId(request.getUserId())
                    .metadata(metadata)
                    .description(request.getDescription())
                    .status("ACTIVE")
                    .build();

            AiSessionHistory saved = aiSessionHistoryRepository.save(sessionHistory);
            log.info("[AiSessionHistory] Created new session: {}", saved.getSessionId());

            return ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                    .status(HttpStatus.CREATED.value())
                    .data(mapToDTO(saved))
                    .message("Session created successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error creating session: {}", e.getMessage());
            return ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error creating session: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> getBySessionId(String sessionId) {
        try {
            return aiSessionHistoryRepository.findBySessionId(sessionId)
                    .map(session -> ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                            .status(HttpStatus.OK.value())
                            .data(mapToDTO(session))
                            .message("Session found")
                            .build())
                    .orElse(ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .message("Session not found")
                            .build());
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error getting session: {}", e.getMessage());
            return ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getByUserId(Long userId) {
        try {
            List<AiSessionHistory> sessions = aiSessionHistoryRepository.findByUserId(userId);
            List<AiSessionHistoryResponseDTO> dtoList = sessions.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .data(dtoList)
                    .count((long) dtoList.size())
                    .message("Sessions retrieved successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error getting sessions by user: {}", e.getMessage());
            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> search(AiSessionHistoryFilterRequest request) {
        try {
            List<AiSessionHistory> sessions = aiSessionHistoryRepository.findAll();

            // Apply filters
            if (request.getUserId() != null) {
                sessions = sessions.stream()
                        .filter(s -> s.getUserId().equals(request.getUserId()))
                        .collect(Collectors.toList());
            }
            if (request.getSessionId() != null && !request.getSessionId().isEmpty()) {
                sessions = sessions.stream()
                        .filter(s -> s.getSessionId().contains(request.getSessionId()))
                        .collect(Collectors.toList());
            }
            if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                sessions = sessions.stream()
                        .filter(s -> s.getStatus().equals(request.getStatus()))
                        .collect(Collectors.toList());
            }

            // Apply pagination
            int start = (request.getPage() - 1) * request.getPage();
            List<AiSessionHistoryResponseDTO> result = sessions.stream()
                    .skip(start)
                    .limit(request.getPage())
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .data(result)
                    .count((long) sessions.size())
                    .message("Search completed successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error searching sessions: {}", e.getMessage());
            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<AiSessionHistoryResponseDTO> update(AiSessionHistoryUpdateRequest request) {
        try {
            return aiSessionHistoryRepository.findById(request.getId())
                    .map(session -> {
                        if (request.getStatus() != null) {
                            session.setStatus(request.getStatus());
                        }
                        if (request.getDescription() != null) {
                            session.setDescription(request.getDescription());
                        }
                        if (request.getMetadata() != null) {
                            try {
                                session.setMetadata(objectMapper.writeValueAsString(request.getMetadata()));
                            } catch (Exception e) {
                                log.error("[AiSessionHistory] Error serializing metadata: {}", e.getMessage());
                            }
                        }

                        AiSessionHistory updated = aiSessionHistoryRepository.save(session);
                        return ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                                .status(HttpStatus.OK.value())
                                .data(mapToDTO(updated))
                                .message("Session updated successfully")
                                .build();
                    })
                    .orElse(ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .message("Session not found")
                            .build());
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error updating session: {}", e.getMessage());
            return ResponseGlobalDto.<AiSessionHistoryResponseDTO>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long id) {
        try {
            aiSessionHistoryRepository.deleteById(id);
            log.info("[AiSessionHistory] Deleted session with id: {}", id);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Session deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error deleting session: {}", e.getMessage());
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .data(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<Boolean> deleteMultiple(List<Long> ids) {
        try {
            aiSessionHistoryRepository.deleteAllById(ids);
            log.info("[AiSessionHistory] Deleted {} sessions", ids.size());
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Sessions deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error deleting sessions: {}", e.getMessage());
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .data(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<AiSessionHistoryResponseDTO>> getActiveSessions(Long userId) {
        try {
            List<AiSessionHistory> sessions = aiSessionHistoryRepository.findActiveSessionsByUserId(userId);
            List<AiSessionHistoryResponseDTO> dtoList = sessions.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .data(dtoList)
                    .count((long) dtoList.size())
                    .message("Active sessions retrieved successfully")
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error getting active sessions: {}", e.getMessage());
            return ResponseGlobalDto.<List<AiSessionHistoryResponseDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    private AiSessionHistoryResponseDTO mapToDTO(AiSessionHistory entity) {
        try {
            Object metadataObj = null;
            if (entity.getMetadata() != null && !entity.getMetadata().isEmpty()) {
                metadataObj = objectMapper.readValue(entity.getMetadata(), Object.class);
            }

            return AiSessionHistoryResponseDTO.builder()
                    .id(entity.getId())
                    .sessionId(entity.getSessionId())
                    .userId(entity.getUserId())
                    .metadata(metadataObj != null ? objectMapper.convertValue(metadataObj, java.util.Map.class) : null)
                    .status(entity.getStatus())
                    .description(entity.getDescription())
                    .createdAt(entity.getCreatedAt())
                    .updatedAt(entity.getUpdatedAt())
                    .creator(entity.getCreator())
                    .updater(entity.getUpdater())
                    .build();
        } catch (Exception e) {
            log.error("[AiSessionHistory] Error mapping to DTO: {}", e.getMessage());
            return AiSessionHistoryResponseDTO.builder()
                    .id(entity.getId())
                    .sessionId(entity.getSessionId())
                    .userId(entity.getUserId())
                    .status(entity.getStatus())
                    .description(entity.getDescription())
                    .build();
        }
    }
}

