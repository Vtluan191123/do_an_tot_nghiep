package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;

public interface AIService {
    ResponseGlobalDto<Object> createPrompt(String prompt) throws Exception;
}
