package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.AiTrainingAnswerCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerUpdateRequest;
import com.dntn.datn_be.dto.response.AiTrainingProjection;
import com.dntn.datn_be.dto.response.QuestionDTO;
import com.dntn.datn_be.dto.response.TopicDTO;
import com.dntn.datn_be.model.AiTrainingAnswer;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AiTrainingAnswerService extends BaseGlobalService<AiTrainingAnswer, AiTrainingAnswerCreateRequest, AiTrainingAnswerFilterRequest, AiTrainingAnswerUpdateRequest, Long> {
    List<TopicDTO> getData();

}

