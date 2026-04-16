package com.dntn.datn_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_subject")
public class UserSubject extends BaseEntity{

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "total")  // Tổng số buổi học hoặc số tháng sử dụng
    private Long total;

    @Column(name = "is_coach")
    private Boolean isCoach;

}
