package com.dntn.datn_be.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "training_room")
public class TrainingRoom extends BaseEntity {
    
    @Column(name = "timeslots_subject_id", nullable = false, unique = true)
    private Long timeSlotsSubjectId;
    
    @Column(name = "coach_id", nullable = false)
    private Long coachId;
    
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "max_capacity", nullable = false)
    private Long maxCapacity;
    
    @Column(name = "current_capacity", columnDefinition = "bigint default 0")
    private Long currentCapacity;
    
    @Column(name = "zoom_link")
    private String zoomLink;
    
    @Column(name = "status", nullable = false)
    private String status;  // ACTIVE, INACTIVE
}

