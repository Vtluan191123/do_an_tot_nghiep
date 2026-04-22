package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingTopicCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicUpdateRequest;
import com.dntn.datn_be.model.AiTrainingTopic;
import com.dntn.datn_be.repository.AiTrainingTopicRepository;
import com.dntn.datn_be.service.AiTrainingTopicService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class AiTrainingTopicServiceImpl implements AiTrainingTopicService {

    private final AiTrainingTopicRepository aiTrainingTopicRepository;

    @Override
    public ResponseGlobalDto<AiTrainingTopic> create(AiTrainingTopicCreateRequest request) throws IOException {
        AiTrainingTopic topic = AiTrainingTopic.builder()
                .topicName(request.getTopicName())
                .code(request.getCode())
                .description(request.getDescription())
                .build();

        aiTrainingTopicRepository.save(topic);

        return ResponseGlobalDto.<AiTrainingTopic>builder()
                .status(HttpStatus.CREATED.value())
                .data(topic)
                .message("Create AI training topic successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<AiTrainingTopic>> gets(AiTrainingTopicFilterRequest request) {
        Page<AiTrainingTopic> page = aiTrainingTopicRepository.search(request);
        return ResponseGlobalDto.<List<AiTrainingTopic>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .message("Get list AI training topics successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingTopic> get(AiTrainingTopicFilterRequest request) {
        Page<AiTrainingTopic> page = aiTrainingTopicRepository.search(request);
        if (!page.hasContent()) {
            return ResponseGlobalDto.<AiTrainingTopic>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("AI training topic not found")
                    .build();
        }
        return ResponseGlobalDto.<AiTrainingTopic>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get AI training topic successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<AiTrainingTopic> update(AiTrainingTopicUpdateRequest request) {
        AiTrainingTopic topic = aiTrainingTopicRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("AI training topic not found"));

        topic.setTopicName(request.getTopicName());
        topic.setCode(request.getCode());
        topic.setDescription(request.getDescription());

        aiTrainingTopicRepository.save(topic);

        return ResponseGlobalDto.<AiTrainingTopic>builder()
                .status(HttpStatus.OK.value())
                .data(topic)
                .message("Update AI training topic successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long id) throws Exception {
        aiTrainingTopicRepository.deleteById(id);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training topic successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> ids) {
        aiTrainingTopicRepository.deleteAllById(ids);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete AI training topics successfully")
                .build();
    }
}

