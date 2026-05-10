package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.UserEnrolledSubjectDetailResponse;
import com.dntn.datn_be.dto.response.UserScheduledTimeSlotResponse;
import com.dntn.datn_be.model.*;
import com.dntn.datn_be.repository.*;
import com.dntn.datn_be.service.UserSubjectEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserSubjectEnrollmentServiceImpl implements UserSubjectEnrollmentService {
    
    private final UserSubjectRepository userSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotsSubjectRepository timeSlotsSubjectRepository;
    private final TimeSlotsRepository timeSlotsRepository;

    @Override
    public ResponseGlobalDto<List<UserEnrolledSubjectDetailResponse>> getUserEnrolledSubjects(Long userId) {
        try {
            // Get all user enrolled subjects (not as coach)
            List<UserSubject> userSubjects = userSubjectRepository.findByUserIdAndIsCoachFalse(userId);
            
            List<UserEnrolledSubjectDetailResponse> responses = new ArrayList<>();
            
            for (UserSubject us : userSubjects) {
                // Get subject details
                Subject subject = subjectRepository.findById(us.getSubjectId())
                        .orElse(null);
                
                if (subject == null) continue;
                
                // Count completed bookings for this subject
                Long completedSessions = bookingRepository.countCompletedBookings(userId, us.getSubjectId(), 2);
                Long remainingSessions = (us.getTotal() != null ? us.getTotal() : 0) - (completedSessions != null ? completedSessions : 0);
                
                UserEnrolledSubjectDetailResponse response = UserEnrolledSubjectDetailResponse.builder()
                        .userSubjectId(us.getId())
                        .subjectId(us.getSubjectId())
                        .subjectName(subject.getName())
                        .subjectDescription(subject.getDescription())
                        .subjectImage(subject.getImages())
                        .price(subject.getPrice())
                        .totalSessions(us.getTotal())
                        .completedSessions(completedSessions != null ? completedSessions : 0)
                        .remainingSessions(remainingSessions > 0 ? remainingSessions : 0)
                        .status(subject.getStatus())
                        .enrollmentDate(us.getCreatedAt() != null ? us.getCreatedAt() : LocalDateTime.now())
                        .createdAt(us.getCreatedAt())
                        .build();
                
                responses.add(response);
            }
            
            return ResponseGlobalDto.<List<UserEnrolledSubjectDetailResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .message("Get user enrolled subjects successfully")
                    .count((long) responses.size())
                    .build();
                    
        } catch (Exception e) {
            return ResponseGlobalDto.<List<UserEnrolledSubjectDetailResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error fetching enrolled subjects: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlots(Long userId) {
        try {
            // Get all bookings for the user
            List<Bookings> bookings = bookingRepository.findByUserId(userId);
            
            if (bookings == null || bookings.isEmpty()) {
                return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                        .status(HttpStatus.OK.value())
                        .data(new ArrayList<>())
                        .message("No scheduled time slots found")
                        .count(0L)
                        .build();
            }
            
            List<UserScheduledTimeSlotResponse> responses = new ArrayList<>();
            
            for (Bookings booking : bookings) {
                // Get TimeSlotsSubject details
                TimeSlotsSubject timeSlotsSubject = timeSlotsSubjectRepository.findById(booking.getTimeSlotSubjectId())
                        .orElse(null);
                
                if (timeSlotsSubject == null) continue;
                
                // Get TimeSlots details
                TimeSlots timeSlots = timeSlotsRepository.findById(timeSlotsSubject.getTimeSlotsId())
                        .orElse(null);
                
                if (timeSlots == null) continue;
                
                UserScheduledTimeSlotResponse response = UserScheduledTimeSlotResponse.builder()
                        .id(booking.getId())
                        .timeSlotSubjectId(booking.getTimeSlotSubjectId())
                        .subjectId(booking.getSubjectId())
                        .subjectName(timeSlotsSubject.getSubjectName())
                        .scheduleDate(timeSlots.getDate())
                        .startTime(timeSlots.getStartTime())
                        .endTime(timeSlots.getEndTime())
                        .trainingMethod(timeSlotsSubject.getTrainingMethods())
                        .coachName(timeSlotsSubject.getCoachFullName())
                        .coachId(timeSlotsSubject.getCoachId())
                        .maxCapacity(timeSlotsSubject.getMaxCapacity())
                        .currentCapacity(timeSlotsSubject.getCurrentCapacity())
                        .bookingStatus(booking.getStatus())
                        .bookingDate(booking.getCreatedAt())
                        .build();
                
                responses.add(response);
            }
            
            // Sort by start time
            responses.sort(Comparator.comparing(UserScheduledTimeSlotResponse::getStartTime));
            
            return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .message("Get user scheduled time slots successfully")
                    .count((long) responses.size())
                    .build();
                    
        } catch (Exception e) {
            return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error fetching scheduled time slots: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<List<UserScheduledTimeSlotResponse>> getUserScheduledTimeSlotsForSubject(Long userId, Long subjectId) {
        try {
            // Get bookings for specific subject
            List<Bookings> bookings = bookingRepository.findByUserIdAndSubjectId(userId, subjectId);
            
            if (bookings == null || bookings.isEmpty()) {
                return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                        .status(HttpStatus.OK.value())
                        .data(new ArrayList<>())
                        .message("No scheduled time slots found for this subject")
                        .count(0L)
                        .build();
            }
            
            List<UserScheduledTimeSlotResponse> responses = new ArrayList<>();
            
            for (Bookings booking : bookings) {
                // Get TimeSlotsSubject details
                TimeSlotsSubject timeSlotsSubject = timeSlotsSubjectRepository.findById(booking.getTimeSlotSubjectId())
                        .orElse(null);
                
                if (timeSlotsSubject == null) continue;
                
                // Get TimeSlots details
                TimeSlots timeSlots = timeSlotsRepository.findById(timeSlotsSubject.getTimeSlotsId())
                        .orElse(null);
                
                if (timeSlots == null) continue;
                
                UserScheduledTimeSlotResponse response = UserScheduledTimeSlotResponse.builder()
                        .id(booking.getId())
                        .timeSlotSubjectId(booking.getTimeSlotSubjectId())
                        .subjectId(booking.getSubjectId())
                        .subjectName(timeSlotsSubject.getSubjectName())
                        .scheduleDate(timeSlots.getDate())
                        .startTime(timeSlots.getStartTime())
                        .endTime(timeSlots.getEndTime())
                        .trainingMethod(timeSlotsSubject.getTrainingMethods())
                        .coachName(timeSlotsSubject.getCoachFullName())
                        .coachId(timeSlotsSubject.getCoachId())
                        .maxCapacity(timeSlotsSubject.getMaxCapacity())
                        .currentCapacity(timeSlotsSubject.getCurrentCapacity())
                        .bookingStatus(booking.getStatus())
                        .bookingDate(booking.getCreatedAt())
                        .build();
                
                responses.add(response);
            }
            
            // Sort by start time
            responses.sort(Comparator.comparing(UserScheduledTimeSlotResponse::getStartTime));
            
            return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .message("Get user scheduled time slots for subject successfully")
                    .count((long) responses.size())
                    .build();
                    
        } catch (Exception e) {
            return ResponseGlobalDto.<List<UserScheduledTimeSlotResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error fetching scheduled time slots: " + e.getMessage())
                    .build();
        }
    }
}

