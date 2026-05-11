package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.AiTrainingDto;
import com.dntn.datn_be.dto.response.UserEnrolledSubjectDetailResponse;
import com.dntn.datn_be.dto.response.UserScheduledTimeSlotResponse;
import com.dntn.datn_be.gemini.client.GeminiApiClient;
import com.dntn.datn_be.gemini.config.GeminiAIProperties;
import com.dntn.datn_be.model.AiSessionHistory;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.model.AiTrainingTopic;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.AiSessionHistoryRepository;
import com.dntn.datn_be.repository.AiTrainingQuestionRepository;
import com.dntn.datn_be.repository.AiTrainingTopicRepository;
import com.dntn.datn_be.service.*;
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
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final GeminiAIProperties geminiAIProperties;
    private final GeminiApiClient geminiApiClient;
    private final ObjectMapper objectMapper;
    private final AiTrainingQuestionRepository aiTrainingQuestionRepository;
    private final AiTrainingTopicRepository aiTrainingTopicRepository;
    private final WebSocketService webSocketService;
    private final AiTrainingAnswerService aiTrainingAnswerService;
    private final AiSessionHistoryRepository aiSessionHistoryRepository;
    private final UserSubjectEnrollmentService userSubjectEnrollmentService;
    private final AuthService authService;



    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);


    @Override
    public ResponseGlobalDto<Object> createPrompt(String question, String sessionId) throws Exception {

        String prompt = buildPrompt(question, sessionId);

        //send prompt to gemini
        String rawAiResponse = callAiWithRetryAndFallback(prompt, 3, 1000);
        //transfer raw data to json
        Object productAIResponse = parseAIResponse(rawAiResponse);

        AiTrainingDto aiTrainingDto = objectMapper.readValue(productAIResponse.toString(), AiTrainingDto.class);

        //save database
        if (!aiTrainingDto.isTraining()) {
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

        // Save/Update session history with question and answer
        if (StringUtils.hasText(sessionId)) {
            try {
                updateSessionHistory(sessionId, question, aiTrainingDto);
                log.info("[AI_RESPONSE] Updated session history for sessionId: {}", sessionId);
            } catch (Exception e) {
                log.error("[AI_RESPONSE] Error updating session history: {}", e.getMessage());
            }
        }

        //send socket to frontend
        try {
            String topic = StringUtils.hasText(sessionId) ? 
                    String.format("ai-response:%s", sessionId) : 
                    "ai-response";
            webSocketService.sendMessage(topic, aiTrainingDto, null);
            log.info("[AI_RESPONSE] Sent AI response to WebSocket topic: {} for sessionId: {}", topic, sessionId);
        } catch (Exception ex) {
            log.error("[AI_RESPONSE] Failed to send message to WebSocket: {}", ex.getMessage());
            // Continue execution even if WebSocket fails
        }

        return ResponseGlobalDto.builder()
                .status(HttpStatus.OK.value())
                .data(productAIResponse)
                .build();
    }

    /**
     * Update session history with question and answer
     */
    private void updateSessionHistory(String sessionId, String question, AiTrainingDto answer) {
        try {
            // Find existing session
            AiSessionHistory session = aiSessionHistoryRepository.findBySessionId(sessionId)
                    .orElse(null);

            if (session == null) {
                log.warn("[SessionHistory] Session not found with sessionId: {}", sessionId);
                return;
            }

            // Parse existing metadata
            Map<String, Object> metadata = new HashMap<>();
            if (session.getMetadata() != null && !session.getMetadata().isEmpty()) {
                metadata = objectMapper.readValue(session.getMetadata(), Map.class);
            }

            // Get or create conversations list
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> conversations = (List<Map<String, Object>>) metadata
                    .getOrDefault("conversations", new ArrayList<>());

            // Create new conversation entry
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("question", question);
            conversation.put("answer", objectMapper.convertValue(answer, Map.class));
            conversation.put("timestamp", LocalDateTime.now().toString());

            // Add to conversations list
            conversations.add(conversation);

            // Update metadata
            metadata.put("conversations", conversations);
            metadata.put("totalConversations", conversations.size());

            // Save updated session
            session.setMetadata(objectMapper.writeValueAsString(metadata));
            aiSessionHistoryRepository.save(session);

            log.info("[SessionHistory] Updated session {} with Q&A. Total conversations: {}", sessionId, conversations.size());
        } catch (Exception e) {
            log.error("[SessionHistory] Error updating session: {}", e.getMessage(), e);
        }
    }

    private String buildPrompt(String prompt,String sessionId ) throws IOException {
        try {
            Path path = Paths.get(
                    System.getProperty("user.dir"),
                    "datn_be",
                    "prompt_base.txt"
            );
            String dataTraining = Files.readString(path, StandardCharsets.UTF_8);

            //get history
            Optional<AiSessionHistory> sessionOpt = aiSessionHistoryRepository.findBySessionId(sessionId);
            if (sessionOpt.isPresent()) {
                AiSessionHistory session = sessionOpt.get();
                if (StringUtils.hasText(session.getMetadata())) {
                    dataTraining = dataTraining + "\n- Đây là lịch sử hội thoại giữa client và AI, bạn có thể dựa vào đây để hiểu hơn về ngữ cảnh của client:\n"
                            + session.getMetadata();
                }
            }

            //Thống kê các môn đã đăng ký
            Users currentUser  = authService.getCurrentUser();
            List<UserEnrolledSubjectDetailResponse> userEnrolledSubjectDetailResponses =
                    userSubjectEnrollmentService.getUserEnrolledSubjects(currentUser.getId()).getData();
            try {
                String enrolledSubjectsData = objectMapper.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(userEnrolledSubjectDetailResponses);
                dataTraining = dataTraining + "\n- Đây là các môn học mà client đã đăng ký:\n"
                        + (userEnrolledSubjectDetailResponses.isEmpty() ? "Người dùng chưa đăng ký môn học nào"  : enrolledSubjectsData);
            } catch (JsonProcessingException e) {
                log.error("[BuildPrompt] Error formatting enrolled subjects with ObjectMapper: {}", e.getMessage());
                dataTraining = dataTraining + "\n- Đây là các môn học mà client đã đăng ký:\n"
                        + userEnrolledSubjectDetailResponses.toString();
            }

            //get data - format với ObjectMapper để dễ đọc
            try {
                String trainingData = objectMapper.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(aiTrainingAnswerService.getData());
                dataTraining = dataTraining + "\n- Đây là data training để bạn dựa vào đây để trả lời, bao gồm chủ đề, các câu hỏi tương ứng chủ đề và các câu trả lời có position:\n"
                        + trainingData;
            } catch (JsonProcessingException e) {
                log.error("[BuildPrompt] Error formatting training data with ObjectMapper: {}", e.getMessage());
                dataTraining = dataTraining + "\n- Đây là data training để bạn dựa vào đây để trả lời, bao gồm chủ đề, các câu hỏi tương ứng chủ đề và các câu trả lời có position:\n"
                        + aiTrainingAnswerService.getData().toString();
            }



            //Thống kê các lịch đã book
            List<UserScheduledTimeSlotResponse> userScheduledTimeSlotResponses =
                    userSubjectEnrollmentService.getUserScheduledTimeSlots(currentUser.getId()).getData();
            try {
                String scheduledTimeSlotsData = objectMapper.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(userScheduledTimeSlotResponses);
                dataTraining = dataTraining + "\n- Đây là các lịch mà client đã đặt lịch:\n"
                        + (userScheduledTimeSlotResponses.isEmpty() ? "Người dùng chưa đặt lịch tập nào" :scheduledTimeSlotsData);
            } catch (JsonProcessingException e) {
                log.error("[BuildPrompt] Error formatting scheduled time slots with ObjectMapper: {}", e.getMessage());
                dataTraining = dataTraining + "\n- Đây là các lịch mà client đã đặt lịch:\n"
                        + userScheduledTimeSlotResponses.toString();
            }


            return dataTraining + "\n\nĐây là câu hỏi của client: " + prompt;
        }catch (Exception e){
            log.error("[BuildPrompt] Error building prompt: {}", e.getMessage(), e);
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
                String response = geminiApiClient.generateText(geminiAIProperties.getPrimaryModel(), prompt, 5000);

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
                String response = geminiApiClient.generateText(geminiAIProperties.getFallbackModel(), prompt, 5000);

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
