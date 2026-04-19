package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.response.EnrolledSubjectResponse;
import java.util.List;

public interface UserEnrolledSubjectService {
    /**
     * Get all enrolled subjects for a user with remaining sessions calculation
     * @param userId User ID
     * @return List of enrolled subjects with remaining sessions
     */
    List<EnrolledSubjectResponse> getEnrolledSubjects(Long userId);
}

