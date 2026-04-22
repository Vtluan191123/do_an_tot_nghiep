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
@Table(name = "ai_training_topic")
public class AiTrainingTopic extends BaseEntity {

    @Column(name = "topic_name", nullable = false)
    private String topicName;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "VARCHAR(MAX)")
    private String description;
}

