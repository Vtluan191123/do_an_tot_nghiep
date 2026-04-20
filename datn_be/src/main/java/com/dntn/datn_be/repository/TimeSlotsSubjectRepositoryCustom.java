package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.model.TimeSlotsSubject;
import org.springframework.data.domain.Page;

public interface TimeSlotsSubjectRepositoryCustom {
    /**
     * Filter and paginate time slots with custom query
     * @param request Filter request
     * @return Paginated results
     */
    Page<TimeSlotsSubject> filter(TimeSlotsSubjectFilterRequest request);
}

