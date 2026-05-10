package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiSessionHistoryFilterRequest extends BaseFilterRequest {

    private Long id;

    private String sessionId;

    private Long userId;

    private String status; // ACTIVE, COMPLETED, ARCHIVED

    private String description;
}

