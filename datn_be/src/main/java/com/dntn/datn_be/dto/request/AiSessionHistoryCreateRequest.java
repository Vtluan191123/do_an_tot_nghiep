package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiSessionHistoryCreateRequest {

    private Long userId;

    private String description;

    /**
     * Metadata containing list of questions and answers
     * Structure: {
     *   "conversations": [
     *     {
     *       "question": "What is AI?",
     *       "answer": {...},
     *       "timestamp": "2024-05-10T10:30:00"
     *     }
     *   ]
     * }
     */
    private Map<String, Object> metadata;
}

