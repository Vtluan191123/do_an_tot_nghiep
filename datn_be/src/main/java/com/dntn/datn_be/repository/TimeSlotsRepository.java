package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.TimeSlots;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotsRepository extends JpaRepository<TimeSlots, Long> {
    
    /**
     * Find time slots by date
     */
    List<TimeSlots> findByDate(LocalDate date);
    
    /**
     * Find time slots by normalized date (YYYYMMDD format)
     */
    List<TimeSlots> findByNormDate(Long normDate);
    
    /**
     * Find all time slots for a date range
     */
    @Query("SELECT t FROM TimeSlots t WHERE t.date >= :startDate AND t.date <= :endDate ORDER BY t.date, t.startTime")
    List<TimeSlots> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Find time slots ordered by date and start time
     */
    @Query("SELECT t FROM TimeSlots t ORDER BY t.date, t.startTime")
    List<TimeSlots> findAllOrderByDateAndTime();
}
