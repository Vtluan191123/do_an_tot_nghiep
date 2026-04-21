package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.model.TimeSlots;
import com.dntn.datn_be.repository.TimeSlotsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotsController {
    
    private final TimeSlotsRepository timeSlotsRepository;
    
    /**
     * Get all time slots with pagination
     */
    @GetMapping
    public ResponseGlobalDto<List<TimeSlotsDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TimeSlots> result = timeSlotsRepository.findAll(pageable);
            
            List<TimeSlotsDto> data = result.getContent().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            
            return ResponseGlobalDto.<List<TimeSlotsDto>>builder()
                    .status(HttpStatus.OK.value())
                    .data(data)
                    .count(result.getTotalElements())
                    .message("Get all time slots successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get time slots by normalized date (YYYYMMDD format)
     * @param normDate Normalized date in format YYYYMMDD (e.g., 20260421 for 2026-04-21)
     */
    @GetMapping("/by-date")
    public ResponseGlobalDto<List<TimeSlotsDto>> getByDate(@RequestParam Long normDate) {
        try {
            List<TimeSlots> result = timeSlotsRepository.findByNormDate(normDate);
            
            List<TimeSlotsDto> data = result.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            
            return ResponseGlobalDto.<List<TimeSlotsDto>>builder()
                    .status(HttpStatus.OK.value())
                    .data(data)
                    .count((long) data.size())
                    .message("Get time slots by date successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<List<TimeSlotsDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get time slot by ID
     */
    @GetMapping("/{id:[0-9]+}")
    public ResponseGlobalDto<TimeSlotsDto> getById(@PathVariable Long id) {
        try {
            TimeSlots timeSlot = timeSlotsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));
            
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToDto(timeSlot))
                    .message("Get time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Create time slot
     */
    @PostMapping
    public ResponseGlobalDto<TimeSlotsDto> create(@RequestBody CreateTimeSlotsRequest request) {
        try {
            TimeSlots timeSlot = new TimeSlots();
            timeSlot.setDate(request.getDate());
            timeSlot.setStartTime(request.getStartTime());
            timeSlot.setEndTime(request.getEndTime());
            
            TimeSlots saved = timeSlotsRepository.save(timeSlot);
            
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.CREATED.value())
                    .data(mapToDto(saved))
                    .message("Create time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Update time slot
     */
    @PutMapping
    public ResponseGlobalDto<TimeSlotsDto> update(@RequestBody UpdateTimeSlotsRequest request) {
        try {
            TimeSlots timeSlot = timeSlotsRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));
            
            if (request.getDate() != null) {
                timeSlot.setDate(request.getDate());
            }
            if (request.getStartTime() != null) {
                timeSlot.setStartTime(request.getStartTime());
            }
            if (request.getEndTime() != null) {
                timeSlot.setEndTime(request.getEndTime());
            }
            
            TimeSlots updated = timeSlotsRepository.save(timeSlot);
            
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToDto(updated))
                    .message("Update time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<TimeSlotsDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Delete time slot
     */
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) {
        try {
            TimeSlots timeSlot = timeSlotsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));
            
            timeSlotsRepository.delete(timeSlot);
            
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Delete time slot successfully")
                    .build();
        } catch (Exception e) {
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    private TimeSlotsDto mapToDto(TimeSlots entity) {
        TimeSlotsDto dto = new TimeSlotsDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
    
    // DTO Classes
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class TimeSlotsDto {
        private Long id;
        private LocalDate date;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
        private Long createdAt;
        private Long updatedAt;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class CreateTimeSlotsRequest {
        private LocalDate date;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class UpdateTimeSlotsRequest {
        private Long id;
        private LocalDate date;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
    }
}


