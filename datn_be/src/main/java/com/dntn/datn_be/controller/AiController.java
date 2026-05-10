package com.dntn.datn_be.controller;

import com.dntn.datn_be.gemini.client.GeminiApiClient;
import com.dntn.datn_be.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

        private final AIService aiService;

        /**
         * Chat with AI and save to session history
         * @param message User question
         * @param sessionId AI session ID (optional)
         * @return AI response
         */
        @PostMapping("/chat")
        public Object chat(@RequestParam String message, 
                          @RequestParam(required = false) String sessionId) throws Exception {
            Object response = aiService.createPrompt(message, sessionId);
            return response;
        }
}
