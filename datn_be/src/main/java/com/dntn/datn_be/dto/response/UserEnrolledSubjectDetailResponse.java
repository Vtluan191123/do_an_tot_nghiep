package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserEnrolledSubjectDetailResponse {
    private Long userSubjectId;
    private Long subjectId;
    private String subjectName;
    private String subjectDescription;
    private String subjectImage;
    private BigDecimal price;
    private Long totalSessions;  // Tổng số buổi đăng ký
    private Long completedSessions;  // Số buổi hoàn thành
    private Long remainingSessions;  // Số buổi còn lại
    private String status;
    private LocalDateTime enrollmentDate;
    private LocalDateTime createdAt;
}

