package com.dntn.datn_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainingRoomResponse {
    
    private Long id;
    
    private Long timeSlotsSubjectId;
    
    private Long coachId;
    
    private String coachName;  // Tên huấn luyện viên
    
    private Long subjectId;
    
    private String subjectName;  // Tên bộ môn
    
    private String name;
    
    private String description;
    
    private Long maxCapacity;  // Sức chứa tối đa
    
    private Long currentCapacity;  // Số học viên đã đăng ký
    
    private String trainingMethods;  // Online or Offline
    
    private String zoomLink;
    
    private String status;
    
    // TimeSlots information
    private LocalDate date;        // Ngày
    private LocalDateTime startTime;  // Giờ bắt đầu
    private LocalDateTime endTime;    // Giờ kết thúc
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

