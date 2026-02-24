package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboSubjectCreateRequest;
import com.dntn.datn_be.dto.request.ComboSubjectUpdateRequest;
import com.dntn.datn_be.model.ComboSubject;
import com.dntn.datn_be.service.ComboSubjectService;

import java.util.List;
import java.util.Objects;

public class ComboSubjectServiceImpl implements ComboSubjectService {
    @Override
    public ResponseGlobalDto<ComboSubject> create(ComboSubjectCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<ComboSubject>> gets(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<ComboSubject> get(List<Long> request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<ComboSubject> update(ComboSubjectUpdateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        return null;
    }
}
