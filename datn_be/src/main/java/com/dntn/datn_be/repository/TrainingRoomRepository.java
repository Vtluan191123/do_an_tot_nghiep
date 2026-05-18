package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.TrainingRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingRoomRepository extends JpaRepository<TrainingRoom, Long>, TrainingRoomRepositoryCustom {
    
    /**
     * Find training room by timeSlots subject ID (unique constraint)
     */
    Optional<TrainingRoom> findByTimeSlotsSubjectId(Long timeSlotsSubjectId);
    
    /**
     * Find all training rooms for a coach
     */
    List<TrainingRoom> findByCoachId(Long coachId);
    
    /**
     * Find all active training rooms for a coach
     */
    List<TrainingRoom> findByCoachIdAndStatus(Long coachId, String status);
    
    /**
     * Find all training rooms for a subject
     */
    List<TrainingRoom> findBySubjectId(Long subjectId);
    
    /**
     * Get online training rooms for USER role (based on confirmed bookings with status = 1)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "INNER JOIN Bookings b ON tr.timeSlotsSubjectId = b.timeSlotSubjectId " +
           "INNER JOIN TimeSlotsSubject ts ON tr.timeSlotsSubjectId = ts.id " +
           "WHERE b.userId = :userId " +
           "AND b.status = 1 " +
           "AND ts.trainingMethods = 'ONLINE' " +
           "AND tr.status = 'ACTIVE'")
    List<TrainingRoom> findOnlineRoomsForUser(@Param("userId") Long userId);
    
    /**
     * Get online training rooms for USER role with pagination (based on confirmed bookings with status = 1)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "INNER JOIN Bookings b ON tr.timeSlotsSubjectId = b.timeSlotSubjectId " +
           "INNER JOIN TimeSlotsSubject ts ON tr.timeSlotsSubjectId = ts.id " +
           "WHERE b.userId = :userId " +
           "AND b.status = 1 " +
           "AND ts.trainingMethods = 'ONLINE' " +
           "AND tr.status = 'ACTIVE'")
    Page<TrainingRoom> findOnlineRoomsForUser(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Get online training rooms for USER role by specific subject (based on confirmed bookings with status = 1)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "INNER JOIN Bookings b ON tr.timeSlotsSubjectId = b.timeSlotSubjectId " +
           "INNER JOIN TimeSlotsSubject ts ON tr.timeSlotsSubjectId = ts.id " +
           "WHERE tr.subjectId = :subjectId " +
           "AND b.userId = :userId " +
           "AND b.status = 1 " +
           "AND ts.trainingMethods = 'ONLINE' " +
           "AND tr.status = 'ACTIVE'")
    List<TrainingRoom> findOnlineRoomsForUserBySubject(@Param("userId") Long userId, @Param("subjectId") Long subjectId);
    
    /**
     * Get online training rooms for COACH role (based on UserSubject - enrolled subjects)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "WHERE tr.subjectId IN (SELECT us.subjectId FROM UserSubject us WHERE us.userId = :userId) " +
           "AND tr.status = 'ACTIVE'")
    List<TrainingRoom> findOnlineRoomsForCoach(@Param("userId") Long userId);
    
    /**
     * Get online training rooms for COACH role with pagination (based on UserSubject - enrolled subjects)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "WHERE tr.subjectId IN (SELECT us.subjectId FROM UserSubject us WHERE us.userId = :userId) " +
           "AND tr.status = 'ACTIVE'")
    Page<TrainingRoom> findOnlineRoomsForCoach(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Get online training rooms for COACH role by specific subject (based on UserSubject - enrolled subjects)
     */
    @Query("SELECT tr FROM TrainingRoom tr " +
           "WHERE tr.subjectId = :subjectId " +
           "AND tr.subjectId IN (SELECT us.subjectId FROM UserSubject us WHERE us.userId = :userId) " +
           "AND tr.status = 'ACTIVE'")
    List<TrainingRoom> findOnlineRoomsForCoachBySubject(@Param("userId") Long userId, @Param("subjectId") Long subjectId);
    
    /**
     * Delete all training rooms for a coach
     */
    void deleteByCoachId(Long coachId);

    List<TrainingRoom> findByStatus(String status);
}

