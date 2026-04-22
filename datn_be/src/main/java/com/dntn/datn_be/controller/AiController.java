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


        @PostMapping("/chat")
        public Object chat(@RequestParam String message) throws Exception {


            Object response = aiService.createPrompt(message);
            return response;
        }
}
