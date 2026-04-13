package com.dntn.datn_be.dto.request;

import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


@Data
public class BaseFilterRequest {
    // pagination
    private int page = 0;
    private int size = 10;

    // sort
    private String sortBy = "id";
    private String sortDirection = "desc"; // asc | desc

    // keyword search (optional)
    private String keyword;

    public Pageable toPageable() {
        // Convert 1-based page from frontend to 0-based for Spring PageRequest
        // Frontend sends page = 1, 2, 3, ...
        // Spring PageRequest expects 0, 1, 2, ...
        int pageZeroBased = page > 0 ? page - 1 : 0;
        
        Sort sort = Sort.by(
                sortDirection.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC,
                sortBy
        );
        return PageRequest.of(pageZeroBased, size, sort);
    }
}
