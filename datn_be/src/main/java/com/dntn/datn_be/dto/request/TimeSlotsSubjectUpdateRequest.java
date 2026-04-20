package com.dntn.datn_be.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimeSlotsSubjectUpdateRequest {
    private Long id;
    private Long maxCapacity;
    private Long currentCapacity;  // Số học viên đã đăng ký
    private String trainingMethods;  // Online or Offline
}

