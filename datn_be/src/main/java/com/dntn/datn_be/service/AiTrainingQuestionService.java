package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.AiTrainingQuestionCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionUpdateRequest;
import com.dntn.datn_be.model.AiTrainingQuestion;

public interface AiTrainingQuestionService extends BaseGlobalService<AiTrainingQuestion, AiTrainingQuestionCreateRequest, AiTrainingQuestionFilterRequest, AiTrainingQuestionUpdateRequest, Long> {
}

