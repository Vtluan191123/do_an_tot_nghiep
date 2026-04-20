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

    // date range filter (optional)
    private String fromDate;
    private String toDate;

    public Pageable toPageable() {
        // Frontend expects:
        // - page: 0 = first page (0-based)
        // - page: 1 = second page (0-based)
        // Spring PageRequest expects 0-based page numbers
        // So use page directly without conversion
        Sort sort = Sort.by(
                sortDirection.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC,
                sortBy
        );
        return PageRequest.of(page, size, sort);
    }
}
