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
@Table(name = "ai_training_question")
public class AiTrainingQuestion extends BaseEntity {

    @Column(name = "topic_id")
    private Long topicId;

    @Column(name = "content", columnDefinition = "VARCHAR(MAX)", nullable = false)
    private String content;

    @Column(name = "status")
    private Integer status; // 0: no answer, 1: has answer

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", insertable = false, updatable = false)
    @JsonIgnore
    private AiTrainingTopic topic;
}

