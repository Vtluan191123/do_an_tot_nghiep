package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.model.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubjectRepositoryCustom {
    Page<Subject> filter(SubjectFilterRequest request, Pageable pageable);
}

