package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.AiTrainingTopicCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicUpdateRequest;
import com.dntn.datn_be.model.AiTrainingTopic;

public interface AiTrainingTopicService extends BaseGlobalService<AiTrainingTopic, AiTrainingTopicCreateRequest, AiTrainingTopicFilterRequest, AiTrainingTopicUpdateRequest, Long> {
}

