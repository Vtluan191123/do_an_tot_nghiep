package com.dntn.datn_be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;


@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "ai_training_answer")
public class AiTrainingAnswer extends BaseEntity {

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "type", nullable = false)
    private String type; // text or image

    @Column(name = "content", columnDefinition = "VARCHAR(MAX)", nullable = false)
    private String content;

    @Column(name = "position")
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    @JsonIgnore
    private AiTrainingQuestion question;
}

