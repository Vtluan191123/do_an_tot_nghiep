package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.SendMessageWebSocketRequest;
import com.dntn.datn_be.dto.response.BaseResultDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.apache.bcel.ExceptionConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Objects;

@Service
public class WebSocketService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketService.class);
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private String ENTITY_NAME = "WebSocketService";

    @Value("${integration.websocket.domain}")
    private String BASE_URI;

    @Value("${integration.websocket.prefix_topic_fanout}")
    private String PRE_FANOUT;

    @Value("${integration.websocket.prefix_topic_direct}")
    private String PRE_DIRECT;

    public WebSocketService(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

    public void sendMessage(String topic, Object dataObj, String clientId) throws Exception {
            callSendMessageWebSocket(topic, dataObj, clientId);
            log.info("[{}] Set Socket with domain: {} topic: {}", ENTITY_NAME, BASE_URI, topic);
    }

    private void callSendMessageWebSocket(String topic, Object dataObj, String clientId) throws Exception {

        String FUNCTION_NAME = "callSendMessageWebSocket";
        String url = BASE_URI + "/api/p/v1/messages";

        try {

            String dataStr;

            if (dataObj instanceof String) {
                dataStr = (String) dataObj;
            } else {
                dataStr = objectMapper.writeValueAsString(dataObj);
            }

            SendMessageWebSocketRequest requestBody = new SendMessageWebSocketRequest();
            requestBody.setClientId(StringUtils.hasText(clientId) ? clientId : "");
            requestBody.setContent(dataStr);

            String prefix = StringUtils.hasText(clientId) ? PRE_DIRECT : PRE_FANOUT;
            requestBody.setTopic(prefix + topic);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<SendMessageWebSocketRequest> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<BaseResultDTO> responseEntity =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            BaseResultDTO.class
                    );

            BaseResultDTO baseResultDTO = responseEntity.getBody();

            if (baseResultDTO == null || !baseResultDTO.isStatus()) {
                throw new Exception("Websocket response error");
            }

            log.info(
                    "Sent message to websocket success [{}]: url={}, request={}, res={}",
                    FUNCTION_NAME,
                    url,
                    requestBody,
                    baseResultDTO
            );

        } catch (Exception e) {
            log.error("[{}] Sent message to websocket fail: {}", FUNCTION_NAME, e.getMessage());
            throw new Exception(e.getMessage());
        }
    }
}
