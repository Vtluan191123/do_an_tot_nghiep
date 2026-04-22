package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.AiTrainingDto;
import com.dntn.datn_be.gemini.client.GeminiApiClient;
import com.dntn.datn_be.gemini.config.GeminiAIProperties;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.model.AiTrainingTopic;
import com.dntn.datn_be.repository.AiTrainingQuestionRepository;
import com.dntn.datn_be.repository.AiTrainingTopicRepository;
import com.dntn.datn_be.service.AIService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final GeminiAIProperties geminiAIProperties;
    private final GeminiApiClient geminiApiClient;
    private final ObjectMapper objectMapper;
    private final AiTrainingQuestionRepository aiTrainingQuestionRepository;
    private final AiTrainingTopicRepository aiTrainingTopicRepository;



    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);


    @Override
    public ResponseGlobalDto<Object> createPrompt(String question) throws Exception {

        String prompt = buildPrompt(question);

        //send prompt to gemini
        String rawAiResponse = callAiWithRetryAndFallback(prompt, 3, 1000);
        //transfer raw data to json
        Object productAIResponse = parseAIResponse(rawAiResponse);

        AiTrainingDto aiTrainingDto = objectMapper.readValue(productAIResponse.toString(), AiTrainingDto.class);

        //save database
        if (!aiTrainingDto.isTrained()) {
            //TODO save database
            //Get topic
            AiTrainingTopic aiTrainingTopic = null;
            if(aiTrainingDto.getTopicCode() != null && !aiTrainingDto.getTopicCode().isEmpty()) {
                aiTrainingTopic = aiTrainingTopicRepository.findByCode(aiTrainingDto.getTopicCode());
            }

            AiTrainingQuestion aiTrainingQuestion = AiTrainingQuestion.builder()
                    .topic(aiTrainingTopic != null ? aiTrainingTopic : null)
                    .content(question)
                    .status(0)
                    .build();
            aiTrainingQuestionRepository.save(aiTrainingQuestion);
        }

        //send socket



        return ResponseGlobalDto.builder()
                .status(HttpStatus.OK.value())
                .data(productAIResponse)
                .build();
    }

    private String buildPrompt(String prompt) throws IOException {
        try {
            String content = Files.readString(Paths.get("D:\\App\\datn\\datn_be\\promt_base.txt"), StandardCharsets.UTF_8);
            return content + prompt;
        }catch (Exception e){
            e.printStackTrace();
        }

        return prompt;
    }


    private Object parseAIResponse(String rawAiResponse) {
        String jsonText = extractJson(rawAiResponse);
        if (!StringUtils.hasText(jsonText)) {
            log.warn("[CREATE_VOICE_ORDER_V2] Empty JSON response from AI");
            throw new RuntimeException("Empty AI response");
        }
        return jsonText;
    }

    private String extractJson(String raw) {
        if (raw == null) throw new IllegalArgumentException("AI raw is null");
        String s = raw.trim();
        // remove code fences
        if (s.startsWith("```")) {
            int idx = s.indexOf('\n');
            if (idx > 0) s = s.substring(idx + 1);
            int end = s.lastIndexOf("```");
            if (end > 0) s = s.substring(0, end);
        }
        // lấy từ { json } cuối cùng
        int start = s.indexOf('{');
        int end = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            s = s.substring(start, end + 1);
        }
        return s.trim();
    }

    private String callAiWithRetryAndFallback(String prompt, int maxRetries, long baseDelayMs) throws Exception {
        Exception lastException = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                log.debug("[AI_CALL] Attempt {} with primary model: {}", attempt + 1, geminiAIProperties.getPrimaryModel());
                String response = geminiApiClient.generateText(geminiAIProperties.getPrimaryModel(), prompt, 2048);

                if (StringUtils.hasText(response)) {
                    log.info("[AI_CALL] Success with primary model on attempt {}", attempt + 1);
                    return response;
                } else {
                    log.warn("[AI_CALL] Empty response from primary model on attempt {}", attempt + 1);
                }
            } catch (Exception ex) {
                lastException = ex;
                log.warn("[AI_CALL] Primary model failed on attempt {}: {}", attempt + 1, ex.getMessage());

                if (attempt < maxRetries) {
                    long delay = baseDelayMs * (long) Math.pow(2, attempt);
                    log.debug("[AI_CALL] Waiting {}ms before retry", delay);
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new Exception("Retry interrupted", ie);
                    }
                }
            }
        }

        log.warn("[AI_CALL] Primary model failed after {} attempts, trying fallback model", maxRetries + 1);
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                log.debug("[AI_CALL] Attempt {} with fallback model: {}", attempt + 1, geminiAIProperties.getFallbackModel());
                String response = geminiApiClient.generateText(geminiAIProperties.getFallbackModel(), prompt, 2048);

                if (StringUtils.hasText(response)) {
                    log.info("[AI_CALL] Success with fallback model on attempt {}", attempt + 1);
                    return response;
                } else {
                    log.warn("[AI_CALL] Empty response from fallback model on attempt {}", attempt + 1);
                }
            } catch (Exception ex) {
                lastException = ex;
                log.warn("[AI_CALL] Fallback model failed on attempt {}: {}", attempt + 1, ex.getMessage());

                if (attempt < maxRetries) {
                    long delay = baseDelayMs * (long) Math.pow(2, attempt);
                    log.debug("[AI_CALL] Waiting {}ms before retry", delay);
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new Exception("Retry interrupted", ie);
                    }
                }
            }
        }

        log.error("[AI_CALL] All AI calls failed after {} attempts on both models", (maxRetries + 1) * 2);
        throw new Exception("All AI model calls failed after retries", lastException);
    }
}
