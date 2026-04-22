package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.AiTrainingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTrainingAnswerRepository extends JpaRepository<AiTrainingAnswer, Long>, AiTrainingAnswerRepositoryCustom {
    List<AiTrainingAnswer> findByQuestionId(Long questionId);
    List<AiTrainingAnswer> findByType(String type);
}

