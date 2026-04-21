package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingUpdateRequest {
    
    private Long id;
    
    private Long userId;
    
    private Long subjectId;
    
    private Long timeSlotSubjectId;
    
    private Integer status; //0 khởi tạo -1 đã xác nhan - 2 dahuy
}

