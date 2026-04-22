package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.AiTrainingAnswerCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerUpdateRequest;
import com.dntn.datn_be.model.AiTrainingAnswer;

public interface AiTrainingAnswerService extends BaseGlobalService<AiTrainingAnswer, AiTrainingAnswerCreateRequest, AiTrainingAnswerFilterRequest, AiTrainingAnswerUpdateRequest, Long> {
}

