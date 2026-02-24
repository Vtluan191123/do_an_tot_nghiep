package com.dntn.datn_be.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "combo_subject_detail")
public class ComboSubjectDetail extends BaseEntity{

    @Column(name = "combo_subject_id")
    private Long comboSubjectId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "total_teach") //tổng số buổi học
    private Long totalTeach;
}
