package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiSessionHistoryUpdateRequest {

    private Long id;

    private String sessionId;

    private String status; // ACTIVE, COMPLETED, ARCHIVED

    private String description;

    private Map<String, Object> metadata; // Update metadata
}

