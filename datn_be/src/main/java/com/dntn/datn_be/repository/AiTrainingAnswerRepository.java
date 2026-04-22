package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.response.AiTrainingProjection;
import com.dntn.datn_be.model.AiTrainingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTrainingAnswerRepository extends JpaRepository<AiTrainingAnswer, Long>, AiTrainingAnswerRepositoryCustom {
    List<AiTrainingAnswer> findByQuestionId(Long questionId);
    List<AiTrainingAnswer> findByType(String type);
    @Query(value = """
    SELECT 
        att.code AS code,
        att.topic_name AS topicName,
        atq.content AS question,
        ata.content AS answer,
        ata.type AS type,
        ata.position AS position
    FROM ai_training_answer ata
    JOIN ai_training_question atq ON ata.question_id = atq.id
    JOIN ai_training_topic att ON atq.topic_id = att.id
    ORDER BY att.code, atq.content, ata.position
""", nativeQuery = true)
    List<AiTrainingProjection> getAllTrainingData();
}

