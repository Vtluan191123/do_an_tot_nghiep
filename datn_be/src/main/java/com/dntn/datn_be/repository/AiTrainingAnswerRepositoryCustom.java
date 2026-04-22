package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.model.AiTrainingAnswer;
import org.springframework.data.domain.Page;

public interface AiTrainingAnswerRepositoryCustom {
    Page<AiTrainingAnswer> search(AiTrainingAnswerFilterRequest request);
}

