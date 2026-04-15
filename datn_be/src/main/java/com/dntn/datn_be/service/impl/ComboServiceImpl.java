package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboCreateRequest;
import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.dto.request.ComboSubjectRequest;
import com.dntn.datn_be.dto.request.ComboUpdateRequest;
import com.dntn.datn_be.dto.response.ComboDetailResponse;
import com.dntn.datn_be.dto.response.ComboSubjectDropdownResponse;
import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.model.ComboSubject;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.ComboRepository;
import com.dntn.datn_be.repository.ComboSubjectRepository;
import com.dntn.datn_be.repository.SubjectRepository;
import com.dntn.datn_be.service.ComboService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;
    private final ComboSubjectRepository comboSubjectRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public ResponseGlobalDto<Combo> create(ComboCreateRequest request) throws IOException {
        Combo combo = Combo.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .prices(request.getPrices())
                .build();
        combo = comboRepository.save(combo);
        
        List<ComboSubject> comboSubjects = new ArrayList<>();
        
        for(ComboSubjectRequest subjectRequest : request.getComboSubjectRequests()){
            ComboSubject comboSubject = ComboSubject.builder()
                    .comboId(combo.getId())
                    .subjectId(subjectRequest.getId())
                    .totalTeach(subjectRequest.getTotalTeach())
                    .build();
            comboSubjects.add(comboSubject);
        }
        
        this.comboSubjectRepository.saveAll(comboSubjects);
        

        return ResponseGlobalDto.<Combo>builder()
                .status(HttpStatus.CREATED.value())
                .data(combo)
                .message("Create combo successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<Combo>> gets(ComboFilterRequest request) {
        Page<Combo> page = comboRepository.filter(request);

        return ResponseGlobalDto.<List<Combo>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .build();
    }

    @Override
    public ResponseGlobalDto<Combo> get(ComboFilterRequest request) {
        Page<Combo> page = comboRepository.filter(request);

        if (page.isEmpty()) {
            return ResponseGlobalDto.<Combo>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Combo not found")
                    .build();
        }

        return ResponseGlobalDto.<Combo>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get combo successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Combo> update(ComboUpdateRequest request) {
        Combo combo = comboRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        // Update fields if not null
        if (request.getCode() != null) combo.setCode(request.getCode());
        if (request.getName() != null) combo.setName(request.getName());
        if (request.getDescription() != null) combo.setDescription(request.getDescription());
        if (request.getPrices() != null) combo.setPrices(request.getPrices());

        comboRepository.save(combo);

        // Handle ComboSubject update
        if (request.getComboSubjectRequests() != null && !request.getComboSubjectRequests().isEmpty()) {
            // Delete all old ComboSubject for this combo
            comboSubjectRepository.deleteByComboId(combo.getId());
            
            // Create and save new ComboSubject
            List<ComboSubject> comboSubjects = new ArrayList<>();
            for (ComboSubjectRequest subjectRequest : request.getComboSubjectRequests()) {
                ComboSubject comboSubject = ComboSubject.builder()
                        .comboId(combo.getId())
                        .subjectId(subjectRequest.getId())
                        .totalTeach(subjectRequest.getTotalTeach())
                        .build();
                comboSubjects.add(comboSubject);
            }
            comboSubjectRepository.saveAll(comboSubjects);
        }

        return ResponseGlobalDto.<Combo>builder()
                .status(HttpStatus.OK.value())
                .data(combo)
                .message("Update combo successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> delete(Long request) {
        Combo combo = comboRepository.findById(request)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        // Delete all ComboSubject first
        comboSubjectRepository.deleteByComboId(combo.getId());
        
        // Then delete Combo
        comboRepository.delete(combo);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete combo successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        List<Combo> combos = comboRepository.findAllById(request);

        if (combos.isEmpty()) {
            throw new RuntimeException("Combo not found");
        }

        // Delete all ComboSubject for each combo
        for (Combo combo : combos) {
            comboSubjectRepository.deleteByComboId(combo.getId());
        }

        comboRepository.deleteAll(combos);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete combos successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<ComboSubjectDropdownResponse>> getSubjectsForDropdown() {
        // Get all distinct subject IDs from combo_subject
        List<Long> subjectIds = comboSubjectRepository.findAllDistinctSubjectIds();

        if (subjectIds.isEmpty()) {
            return ResponseGlobalDto.<List<ComboSubjectDropdownResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(new ArrayList<>())
                    .message("No subjects found in combos")
                    .build();
        }

        // Fetch subject details
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);

        // Map to response DTOs
        List<ComboSubjectDropdownResponse> responses = subjects.stream()
                .map(s -> ComboSubjectDropdownResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());

        return ResponseGlobalDto.<List<ComboSubjectDropdownResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .count((long) responses.size())
                .message("Get subjects for dropdown successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<ComboDetailResponse> getComboDetail(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElse(null);

        if (combo == null) {
            return ResponseGlobalDto.<ComboDetailResponse>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Combo not found")
                    .build();
        }

        // Get all subjects for this combo
        List<ComboSubject> comboSubjects = comboSubjectRepository.findAll()
                .stream()
                .filter(cs -> cs.getComboId().equals(id))
                .collect(Collectors.toList());

        // Map to response
        List<ComboDetailResponse.ComboSubjectDetail> subjects = comboSubjects.stream()
                .map(cs -> ComboDetailResponse.ComboSubjectDetail.builder()
                        .subjectId(cs.getSubjectId())
                        .totalTeach(cs.getTotalTeach())
                        .build())
                .collect(Collectors.toList());

        ComboDetailResponse response = ComboDetailResponse.builder()
                .id(combo.getId())
                .code(combo.getCode())
                .name(combo.getName())
                .description(combo.getDescription())
                .prices(combo.getPrices())
                .createdAt(combo.getCreatedAt())
                .updatedAt(combo.getUpdatedAt())
                .comboSubjects(subjects)
                .build();

        return ResponseGlobalDto.<ComboDetailResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .message("Get combo detail successfully")
                .build();
    }
}
