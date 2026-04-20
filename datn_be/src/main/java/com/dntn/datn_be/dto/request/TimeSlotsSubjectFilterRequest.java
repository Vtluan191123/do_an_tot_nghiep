package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimeSlotsSubjectFilterRequest {
    private Long coachId;
    private Long subjectId;
    private String subjectName;
    private String date;
    private String trainingMethods;
    private String status; // available, full, past
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
    
    public Pageable toPageable() {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String field = sortBy != null && !sortBy.isEmpty() ? sortBy : "date";
        
        return PageRequest.of(page != null ? page : 0, size != null ? size : 10, Sort.by(direction, field));
    }
}

