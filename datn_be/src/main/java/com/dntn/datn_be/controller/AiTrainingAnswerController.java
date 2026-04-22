package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.AiTrainingAnswerCreateRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.dto.request.AiTrainingAnswerUpdateRequest;
import com.dntn.datn_be.model.AiTrainingAnswer;
import com.dntn.datn_be.service.AiTrainingAnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai-training/answer")
@RequiredArgsConstructor
public class AiTrainingAnswerController {

    private final AiTrainingAnswerService aiTrainingAnswerService;

    // ================== CREATE ==================
    /**
     * Create a new AI training answer
     * @param request Answer creation data
     * @return Created answer
     */
    @PostMapping
    public ResponseGlobalDto<AiTrainingAnswer> create(@RequestBody AiTrainingAnswerCreateRequest request) throws IOException {
        return aiTrainingAnswerService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of AI training answers with filter and pagination
     * @param request Filter request with pagination
     * @return List of answers
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<AiTrainingAnswer>> gets(@RequestBody AiTrainingAnswerFilterRequest request) {
        return aiTrainingAnswerService.gets(request);
    }

    // ================== GET BY ID ==================
    /**
     * Get AI training answer by ID
     * @param id Answer ID
     * @return Answer details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<AiTrainingAnswer> get(@PathVariable Long id) {
        AiTrainingAnswerFilterRequest request = new AiTrainingAnswerFilterRequest();
        request.setId(id);
        return aiTrainingAnswerService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update AI training answer information
     * @param request Answer update data
     * @return Updated answer
     */
    @PutMapping
    public ResponseGlobalDto<AiTrainingAnswer> update(@RequestBody AiTrainingAnswerUpdateRequest request) {
        return aiTrainingAnswerService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete an AI training answer by ID
     * @param id Answer ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return aiTrainingAnswerService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple AI training answers
     * @param ids List of answer IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return aiTrainingAnswerService.deletes(ids);
    }
}

