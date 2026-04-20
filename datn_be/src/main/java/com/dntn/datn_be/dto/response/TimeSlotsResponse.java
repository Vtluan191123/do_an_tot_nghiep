package com.dntn.datn_be.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimeSlotsResponse {
    private Long id;
    private LocalDate date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long createdAt;
    private Long updatedAt;
}

