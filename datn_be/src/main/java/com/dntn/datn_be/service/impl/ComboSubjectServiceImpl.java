package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboSubjectCreateRequest;
import com.dntn.datn_be.dto.request.ComboSubjectUpdateRequest;
import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.service.ComboSubjectService;

import java.util.List;

public class ComboSubjectServiceImpl implements ComboSubjectService {
    @Override
    public ResponseGlobalDto<Combo> create(ComboSubjectCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<Combo>> gets(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Combo> get(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Combo> update(ComboSubjectUpdateRequest request) {
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
