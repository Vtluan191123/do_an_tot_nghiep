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

    @Column(name = "total_teach") //tổng số buổi học
    private Long totalTeach;

    @OneToMany(mappedBy = "userSubject",fetch = FetchType.LAZY)
    private List<UserSubjectDetail> userSubjectDetails;

}
