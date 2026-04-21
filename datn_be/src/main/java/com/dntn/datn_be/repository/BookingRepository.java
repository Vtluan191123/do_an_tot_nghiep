package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Bookings, Long>, BookingRepositoryCustom {
    
    /**
     * Count completed bookings for a user and subject
     * @param userId User ID
     * @param subjectId Subject ID
     * @param completedStatus Status value for completed booking (typically 2)
     * @return Number of completed bookings
     */
    @Query("SELECT COUNT(b) FROM Bookings b WHERE b.userId = :userId AND b.subjectId = :subjectId AND b.status = :completedStatus")
    Long countCompletedBookings(Long userId, Long subjectId, Integer completedStatus);

    Bookings findByUserIdAndTimeSlotSubjectId(Long userId, Long timeSlotSubjectId);
}

