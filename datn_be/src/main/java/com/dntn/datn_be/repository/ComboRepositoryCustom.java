package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.model.Combo;
import org.springframework.data.domain.Page;

public interface ComboRepositoryCustom {
    Page<Combo> filter(ComboFilterRequest request);
}

