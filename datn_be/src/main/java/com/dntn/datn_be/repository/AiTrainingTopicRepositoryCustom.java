package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.AiTrainingTopicFilterRequest;
import com.dntn.datn_be.model.AiTrainingTopic;
import org.springframework.data.domain.Page;

public interface AiTrainingTopicRepositoryCustom {
    Page<AiTrainingTopic> search(AiTrainingTopicFilterRequest request);
}

