package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.ComboCreateRequest;
import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.dto.request.ComboUpdateRequest;
import com.dntn.datn_be.model.Combo;

public interface ComboService extends BaseGlobalService<Combo, ComboCreateRequest, ComboFilterRequest, ComboUpdateRequest, Long> {
}
