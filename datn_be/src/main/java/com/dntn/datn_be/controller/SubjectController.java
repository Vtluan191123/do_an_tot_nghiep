package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.SubjectCreateRequest;
import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.dto.request.SubjectUpdateRequest;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/subject")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    // ================== CREATE ==================
    /**
     * Create a new subject
     * @param request Subject creation data
     * @return Created subject
     */
    @PostMapping
    public ResponseGlobalDto<Subject> create(@RequestBody SubjectCreateRequest request) throws IOException {
        return subjectService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of subjects with filter and pagination
     * @param request Filter request with pagination
     * @return List of subjects
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<Subject>> gets(@RequestBody SubjectFilterRequest request) {
        return subjectService.gets(request);
    }

    // ================== GET BY ID ==================
    /**
     * Get subject by ID
     * @param id Subject ID
     * @return Subject details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<Subject> get(@PathVariable Long id) {
        SubjectFilterRequest request = new SubjectFilterRequest();
        request.setId(id);
        return subjectService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update subject information
     * @param request Subject update data
     * @return Updated subject
     */
    @PutMapping
    public ResponseGlobalDto<Subject> update(@RequestBody SubjectUpdateRequest request) {
        return subjectService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete a subject by ID
     * @param id Subject ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return subjectService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple subjects
     * @param ids List of subject IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return subjectService.deletes(ids);
    }
}
