package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboCreateRequest;
import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.dto.request.ComboUpdateRequest;
import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.service.ComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/combo")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    // ================== CREATE ==================
    /**
     * Create a new combo
     * @param request Combo creation data
     * @return Created combo
     */
    @PostMapping
    public ResponseGlobalDto<Combo> create(@RequestBody ComboCreateRequest request) throws IOException {
        return comboService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of combos with filter and pagination
     * @param request Filter request with pagination
     * @return List of combos
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<Combo>> gets(@RequestBody ComboFilterRequest request) {
        return comboService.gets(request);
    }

    // ================== GET BY ID ==================
    /**
     * Get combo by ID
     * @param id Combo ID
     * @return Combo details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<Combo> get(@PathVariable Long id) {
        ComboFilterRequest request = new ComboFilterRequest();
        request.setId(id);
        return comboService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update combo information
     * @param request Combo update data
     * @return Updated combo
     */
    @PutMapping
    public ResponseGlobalDto<Combo> update(@RequestBody ComboUpdateRequest request) {
        return comboService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete a combo by ID
     * @param id Combo ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return comboService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple combos
     * @param ids List of combo IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return comboService.deletes(ids);
    }
}
