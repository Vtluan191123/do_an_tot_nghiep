package com.dntn.datn_be.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "time_slots_subject")
public class TimeSlotsSubject extends BaseEntity{
    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "time_slots_id")
    private Long timeSlotsId;

    @Column(name = "max_capacity")
    private Long maxCapacity;

    @Column(name = "current_capacity",columnDefinition = "bigint default 0")
    private Long currentCapacity;

    @Column(name = "training_methods")
    private String trainingMethods;

    @Column(name = "coach_id")
    private Long coachId;

    @Column(name = "coach_full_name")
    private String coachFullName;

    @Column(name = "subject_name")
    private String subjectName;
}
