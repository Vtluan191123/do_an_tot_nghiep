package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingQuestionCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionUpdateRequest;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.repository.AiTrainingQuestionRepository;
import com.dntn.datn_be.service.AiTrainingQuestionService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class AiTrainingQuestionServiceImpl implements AiTrainingQuestionService {

    private final AiTrainingQuestionRepository aiTrainingQuestionRepository;

    @Override
    public ResponseGlobalDto<AiTrainingQuestion> create(AiTrainingQuestionCreateRequest request) throws IOException {
        AiTrainingQuestion question = AiTrainingQuestion.builder()
                .topicId(request.getTopicId())
                .content(request.getContent())
                .status(request.getStatus() != null ? request.getStatus() : 0)
                .build();

        aiTrainingQuestionRepository.save(question);

        return ResponseGlobalDto.<AiTrainingQuestion>builder()
                .status(HttpStatus.CREATED.value())
                .data(question)
                .message("Create AI training question successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<AiTrainingQuestion>> gets(AiTrainingQuestionFilterRequest request) {
        Page<AiTrainingQuestion> page = aiTrainingQuestionRepository.search(request);
        return ResponseGlobalDto.<List<AiTrainingQuestion>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .message("Get list AI training questions successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingQuestion> get(AiTrainingQuestionFilterRequest request) {
        Page<AiTrainingQuestion> page = aiTrainingQuestionRepository.search(request);
        if (!page.hasContent()) {
            return ResponseGlobalDto.<AiTrainingQuestion>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("AI training question not found")
                    .build();
        }
        return ResponseGlobalDto.<AiTrainingQuestion>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get AI training question successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingQuestion> update(AiTrainingQuestionUpdateRequest request) {
        AiTrainingQuestion question = aiTrainingQuestionRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("AI training question not found"));

        question.setTopicId(request.getTopicId());
        question.setContent(request.getContent());
        question.setStatus(request.getStatus());

        aiTrainingQuestionRepository.save(question);

        return ResponseGlobalDto.<AiTrainingQuestion>builder()
                .status(HttpStatus.OK.value())
                .data(question)
                .message("Update AI training question successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long id) throws Exception {
        aiTrainingQuestionRepository.deleteById(id);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training question successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> ids) {
        aiTrainingQuestionRepository.deleteAllById(ids);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training questions successfully")
                .build();
    }
}

