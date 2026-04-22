package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingAnswerCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerUpdateRequest;
import com.dntn.datn_be.model.AiTrainingAnswer;
import com.dntn.datn_be.repository.AiTrainingAnswerRepository;
import com.dntn.datn_be.service.AiTrainingAnswerService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class AiTrainingAnswerServiceImpl implements AiTrainingAnswerService {

    private final AiTrainingAnswerRepository aiTrainingAnswerRepository;

    @Override
    public ResponseGlobalDto<AiTrainingAnswer> create(AiTrainingAnswerCreateRequest request) throws IOException {
        AiTrainingAnswer answer = AiTrainingAnswer.builder()
                .questionId(request.getQuestionId())
                .type(request.getType())
                .content(request.getContent())
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .build();

        aiTrainingAnswerRepository.save(answer);

        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.CREATED.value())
                .data(answer)
                .message("Create AI training answer successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<AiTrainingAnswer>> gets(AiTrainingAnswerFilterRequest request) {
        Page<AiTrainingAnswer> page = aiTrainingAnswerRepository.search(request);
        return ResponseGlobalDto.<List<AiTrainingAnswer>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .message("Get list AI training answers successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingAnswer> get(AiTrainingAnswerFilterRequest request) {
        Page<AiTrainingAnswer> page = aiTrainingAnswerRepository.search(request);
        if (!page.hasContent()) {
            return ResponseGlobalDto.<AiTrainingAnswer>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("AI training answer not found")
                    .build();
        }
        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get AI training answer successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingAnswer> update(AiTrainingAnswerUpdateRequest request) {
        AiTrainingAnswer answer = aiTrainingAnswerRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("AI training answer not found"));

        answer.setQuestionId(request.getQuestionId());
        answer.setType(request.getType());
        answer.setContent(request.getContent());
        answer.setPosition(request.getPosition());

        aiTrainingAnswerRepository.save(answer);

        return ResponseGlobalDto.<AiTrainingAnswer>builder()
                .status(HttpStatus.OK.value())
                .data(answer)
                .message("Update AI training answer successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long id) throws Exception {
        aiTrainingAnswerRepository.deleteById(id);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training answer successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> ids) {
        aiTrainingAnswerRepository.deleteAllById(ids);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training answers successfully")
                .build();
    }
}

