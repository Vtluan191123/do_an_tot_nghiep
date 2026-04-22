package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.AiTrainingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTrainingQuestionRepository extends JpaRepository<AiTrainingQuestion, Long>, AiTrainingQuestionRepositoryCustom {
    List<AiTrainingQuestion> findByTopicId(Long topicId);
    List<AiTrainingQuestion> findByStatus(Integer status);
}

