package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.TimeSlotsSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotsSubjectRepository extends JpaRepository<TimeSlotsSubject, Long>, TimeSlotsSubjectRepositoryCustom {
    
    /**
     * Find all time slots for a specific subject
     */
    List<TimeSlotsSubject> findBySubjectId(Long subjectId);
    
    /**
     * Find all time slots for a specific coach
     */
    List<TimeSlotsSubject> findByCoachId(Long coachId);
    
    /**
     * Find a specific time slot by subject and time slot IDs
     */
    @Query("SELECT t FROM TimeSlotsSubject t WHERE t.subjectId = :subjectId AND t.timeSlotsId = :timeSlotsId")
    Optional<TimeSlotsSubject> findBySubjectIdAndTimeSlotId(@Param("subjectId") Long subjectId, @Param("timeSlotsId") Long timeSlotsId);
    
    /**
     * Find time slots by coach and subject
     */
    @Query("SELECT t FROM TimeSlotsSubject t WHERE t.coachId = :coachId AND t.subjectId = :subjectId")
    List<TimeSlotsSubject> findByCoachIdAndSubjectId(@Param("coachId") Long coachId, @Param("subjectId") Long subjectId);
    
    /**
     * Delete all time slots for a subject
     */
    void deleteBySubjectId(Long subjectId);
    
    /**
     * Delete all time slots for a coach
     */
    void deleteByCoachId(Long coachId);
}

