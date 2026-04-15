package com.dntn.datn_be.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "combo_subject")
public class ComboSubject extends BaseEntity{

    @Column(name = "combo_id")
    private Long comboId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "total_teach") //tổng số buổi học
    private Integer totalTeach;
}
