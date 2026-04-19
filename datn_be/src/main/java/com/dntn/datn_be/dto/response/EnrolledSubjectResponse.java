package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnrolledSubjectResponse {
    private Long userSubjectId;
    private Long subjectId;
    private String subjectName;
    private Long total;  // Tổng số buổi
    private Long remaining;  // Số buổi còn lại
    private LocalDateTime enrollmentDate;
}

