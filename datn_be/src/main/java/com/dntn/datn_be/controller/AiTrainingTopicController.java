package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingTopicCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingTopicUpdateRequest;
import com.dntn.datn_be.model.AiTrainingTopic;
import com.dntn.datn_be.service.AiTrainingTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai-training/topic")
@RequiredArgsConstructor
public class AiTrainingTopicController {

    private final AiTrainingTopicService aiTrainingTopicService;

    // ================== CREATE ==================
    /**
     * Create a new AI training topic
     * @param request Topic creation data
     * @return Created topic
     */
    @PostMapping
    public ResponseGlobalDto<AiTrainingTopic> create(@RequestBody AiTrainingTopicCreateRequest request) throws IOException {
        return aiTrainingTopicService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of AI training topics with filter and pagination
     * @param request Filter request with pagination
     * @return List of topics
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<AiTrainingTopic>> gets(@RequestBody AiTrainingTopicFilterRequest request) {
        return aiTrainingTopicService.gets(request);
    }

    // ================== GET BY ID ==================
    /**
     * Get AI training topic by ID
     * @param id Topic ID
     * @return Topic details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<AiTrainingTopic> get(@PathVariable Long id) {
        AiTrainingTopicFilterRequest request = new AiTrainingTopicFilterRequest();
        request.setId(id);
        return aiTrainingTopicService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update AI training topic information
     * @param request Topic update data
     * @return Updated topic
     */
    @PutMapping
    public ResponseGlobalDto<AiTrainingTopic> update(@RequestBody AiTrainingTopicUpdateRequest request) {
        return aiTrainingTopicService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete an AI training topic by ID
     * @param id Topic ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return aiTrainingTopicService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple AI training topics
     * @param ids List of topic IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return aiTrainingTopicService.deletes(ids);
    }
}

