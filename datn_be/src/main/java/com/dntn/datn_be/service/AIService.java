package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;

public interface AIService {
    /**
     * Create prompt and save to session history
     * @param prompt User question
     * @param sessionId AI session ID (optional)
     * @return AI response
     */
    ResponseGlobalDto<Object> createPrompt(String prompt, String sessionId) throws Exception;
}
