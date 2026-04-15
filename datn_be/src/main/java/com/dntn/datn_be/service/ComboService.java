package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.ComboCreateRequest;
import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.dto.request.ComboUpdateRequest;
import com.dntn.datn_be.dto.response.ComboDetailResponse;
import com.dntn.datn_be.dto.response.ComboSubjectDropdownResponse;
import com.dntn.datn_be.model.Combo;

import java.util.List;

public interface ComboService extends BaseGlobalService<Combo, ComboCreateRequest, ComboFilterRequest, ComboUpdateRequest, Long> {
    
    /**
     * Get all subjects that have combos for dropdown selection
     * @return List of subjects available in combos
     */
    ResponseGlobalDto<List<ComboSubjectDropdownResponse>> getSubjectsForDropdown();
    
    /**
     * Get combo details with subjects
     * @param id Combo ID
     * @return Combo with list of subjects
     */
    ResponseGlobalDto<ComboDetailResponse> getComboDetail(Long id);
}


