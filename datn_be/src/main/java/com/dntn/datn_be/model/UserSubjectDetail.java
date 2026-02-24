package com.dntn.datn_be.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_subject_detail")
public class UserSubjectDetail extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_subject_id")
    private UserSubject userSubject;

    @Column(name = "teach_hour")
    private LocalDateTime teachingHour;

}
