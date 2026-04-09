package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboCreateRequest;
import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.dto.request.ComboUpdateRequest;
import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.repository.ComboRepository;
import com.dntn.datn_be.service.ComboService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;

    @Override
    public ResponseGlobalDto<Combo> create(ComboCreateRequest request) throws IOException {
        Combo combo = Combo.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .prices(request.getPrices())
                .build();

        comboRepository.save(combo);

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
    public ResponseGlobalDto<Combo> update(ComboUpdateRequest request) {
        Combo combo = comboRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        // Update fields if not null
        if (request.getCode() != null) combo.setCode(request.getCode());
        if (request.getName() != null) combo.setName(request.getName());
        if (request.getDescription() != null) combo.setDescription(request.getDescription());
        if (request.getPrices() != null) combo.setPrices(request.getPrices());

        comboRepository.save(combo);

        return ResponseGlobalDto.<Combo>builder()
                .status(HttpStatus.OK.value())
                .data(combo)
                .message("Update combo successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        Combo combo = comboRepository.findById(request)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        comboRepository.delete(combo);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete combo successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        List<Combo> combos = comboRepository.findAllById(request);

        if (combos.isEmpty()) {
            throw new RuntimeException("Combo not found");
        }

        comboRepository.deleteAll(combos);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete combos successfully")
                .build();
    }
}
