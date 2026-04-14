package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.SubjectCreateRequest;
import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.dto.request.SubjectUpdateRequest;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.SubjectRepository;
import com.dntn.datn_be.service.SubjectService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;

    @Override
    public ResponseGlobalDto<Subject> create(SubjectCreateRequest request) throws IOException {
        Subject subject = Subject.builder()
                .name(request.getName())
                .description(request.getDescription())
                .images(request.getImages())
                .status(request.getStatus())
                .size(request.getSize())
                .build();

        subjectRepository.save(subject);

        return ResponseGlobalDto.<Subject>builder()
                .status(HttpStatus.CREATED.value())
                .data(subject)
                .message("Create subject successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<Subject>> gets(SubjectFilterRequest request) {
        Page<Subject> page = subjectRepository.filter(request, request.toPageable());

        return ResponseGlobalDto.<List<Subject>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .build();
    }

    @Override
    public ResponseGlobalDto<Subject> get(SubjectFilterRequest request) {
        Page<Subject> page = subjectRepository.filter(request, request.toPageable());

        if (page.isEmpty()) {
            return ResponseGlobalDto.<Subject>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Subject not found")
                    .build();
        }

        return ResponseGlobalDto.<Subject>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get subject successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Subject> update(SubjectUpdateRequest request) {
        Subject subject = subjectRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // Update fields if not null
        if (request.getName() != null) subject.setName(request.getName());
        if (request.getDescription() != null) subject.setDescription(request.getDescription());
        if (request.getImages() != null) subject.setImages(request.getImages());
        if (request.getStatus() != null) subject.setStatus(request.getStatus());
        if (request.getSize() > 0) subject.setSize(request.getSize());

        subjectRepository.save(subject);

        return ResponseGlobalDto.<Subject>builder()
                .status(HttpStatus.OK.value())
                .data(subject)
                .message("Update subject successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        Subject subject = subjectRepository.findById(request)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        subjectRepository.delete(subject);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete subject successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        List<Subject> subjects = subjectRepository.findAllById(request);

        if (subjects.isEmpty()) {
            throw new RuntimeException("Subject not found");
        }

        subjectRepository.deleteAll(subjects);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete subjects successfully")
                .build();
    }
}
