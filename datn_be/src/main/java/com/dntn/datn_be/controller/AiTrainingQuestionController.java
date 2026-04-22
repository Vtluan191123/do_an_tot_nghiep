package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingQuestionCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingQuestionUpdateRequest;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.service.AiTrainingQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai-training/question")
@RequiredArgsConstructor
public class AiTrainingQuestionController {

    private final AiTrainingQuestionService aiTrainingQuestionService;

    // ================== CREATE ==================
    /**
     * Create a new AI training question
     * @param request Question creation data
     * @return Created question
     */
    @PostMapping
    public ResponseGlobalDto<AiTrainingQuestion> create(@RequestBody AiTrainingQuestionCreateRequest request) throws IOException {
        return aiTrainingQuestionService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of AI training questions with filter and pagination
     * @param request Filter request with pagination
     * @return List of questions
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<AiTrainingQuestion>> gets(@RequestBody AiTrainingQuestionFilterRequest request) {
        return aiTrainingQuestionService.gets(request);
    }

    // ================== GET BY ID ==================
    /**
     * Get AI training question by ID
     * @param id Question ID
     * @return Question details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<AiTrainingQuestion> get(@PathVariable Long id) {
        AiTrainingQuestionFilterRequest request = new AiTrainingQuestionFilterRequest();
        request.setId(id);
        return aiTrainingQuestionService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update AI training question information
     * @param request Question update data
     * @return Updated question
     */
    @PutMapping
    public ResponseGlobalDto<AiTrainingQuestion> update(@RequestBody AiTrainingQuestionUpdateRequest request) {
        return aiTrainingQuestionService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete an AI training question by ID
     * @param id Question ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return aiTrainingQuestionService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple AI training questions
     * @param ids List of question IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return aiTrainingQuestionService.deletes(ids);
    }
}

