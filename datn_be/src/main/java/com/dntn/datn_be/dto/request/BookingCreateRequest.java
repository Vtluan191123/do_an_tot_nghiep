package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingCreateRequest {
    
    private Long userId;
    
    private Long subjectId;
    
    private Long timeSlotId;
    
    private Integer status;
}

