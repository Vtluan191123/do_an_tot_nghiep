package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.response.EnrolledSubjectResponse;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.model.UserSubject;
import com.dntn.datn_be.repository.BookingRepository;
import com.dntn.datn_be.repository.SubjectRepository;
import com.dntn.datn_be.repository.UserSubjectRepository;
import com.dntn.datn_be.service.UserEnrolledSubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserEnrolledSubjectServiceImpl implements UserEnrolledSubjectService {

    private final UserSubjectRepository userSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final BookingRepository bookingRepository;

    @Override
    public List<EnrolledSubjectResponse> getEnrolledSubjects(Long userId) {
        // Get all enrolled subjects for this user (where isCoach = false)
        List<UserSubject> userSubjects = userSubjectRepository.findByUserIdAndIsCoachFalse(userId);

        return userSubjects.stream()
                .map(userSubject -> {
                    // Get subject details
                    Subject subject = subjectRepository.findById(userSubject.getSubjectId())
                            .orElse(null);

                    // Count completed bookings (assuming status 2 means completed)
                    Long completedBookings = bookingRepository.countCompletedBookings(
                            userId,
                            userSubject.getSubjectId(),
                            2  // Status 2 = Completed
                    );

                    // Calculate remaining sessions
                    Long remaining = userSubject.getTotal() - (completedBookings != null ? completedBookings : 0);

                    return EnrolledSubjectResponse.builder()
                            .userSubjectId(userSubject.getId())
                            .subjectId(userSubject.getSubjectId())
                            .subjectName(subject != null ? subject.getName() : "Unknown")
                            .total(userSubject.getTotal())
                            .remaining(Math.max(0, remaining))  // Ensure remaining is not negative
                            .enrollmentDate(userSubject.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}

