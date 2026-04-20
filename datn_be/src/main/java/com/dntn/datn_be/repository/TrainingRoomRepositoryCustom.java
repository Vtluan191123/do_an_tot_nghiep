package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.TrainingRoomFilterRequest;
import com.dntn.datn_be.model.TrainingRoom;
import org.springframework.data.domain.Page;

public interface TrainingRoomRepositoryCustom {
    /**
     * Filter and paginate training rooms with custom query
     * @param request Filter request
     * @return Paginated results
     */
    Page<TrainingRoom> filter(TrainingRoomFilterRequest request);
}

