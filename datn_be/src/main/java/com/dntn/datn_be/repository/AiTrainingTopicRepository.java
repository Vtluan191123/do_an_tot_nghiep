package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.AiTrainingTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTrainingTopicRepository extends JpaRepository<AiTrainingTopic, Long>, AiTrainingTopicRepositoryCustom {
    List<AiTrainingTopic> findByTopicNameContainingIgnoreCase(String topicName);
    AiTrainingTopic findByCode(String code);
}

