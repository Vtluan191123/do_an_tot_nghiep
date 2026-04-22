package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.AiTrainingQuestionFilterRequest;
import com.dntn.datn_be.model.AiTrainingQuestion;
import org.springframework.data.domain.Page;

public interface AiTrainingQuestionRepositoryCustom {
    Page<AiTrainingQuestion> search(AiTrainingQuestionFilterRequest request);
}

