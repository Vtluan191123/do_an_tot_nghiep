package com.dntn.datn_be.gemini.client;

import com.dntn.datn_be.constants.GeminiAIConstants;
import com.dntn.datn_be.gemini.config.GeminiAIProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.cert.X509Certificate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;


@Component
public class GeminiApiClient {
    private final String ENTITY_NAME = "GeminiApiClient";
    private final RestTemplate restTemplate;
    private final GeminiAIProperties geminiAIProperties;
    private final ObjectMapper objectMapper;

    static {
        try {
            TrustManager[] trustAllCerts = new TrustManager[] {
                    new X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}

                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    },
            };

            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, sslSession) -> true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public GeminiApiClient(RestTemplate restTemplate, GeminiAIProperties geminiAIProperties, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.geminiAIProperties = geminiAIProperties;
        this.objectMapper = objectMapper;
    }

    public String generateText(String model, String prompt, Integer maxOutputTokens) {
        String url = String.format(
                GeminiAIConstants.Connection.URL_FORMAT,
                geminiAIProperties.getBaseUrl(),
                model,
                geminiAIProperties.getApiKey()
        );

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put(GeminiAIConstants.Parse.DETERMINISTIC, 0); // deterministic cho parsing
        if (maxOutputTokens != null) {
            generationConfig.put(GeminiAIConstants.Config.MAX_OUTPUT_TOKEN, maxOutputTokens);
        }

        Map<String, Object> body = new HashMap<>();
        body.put(GeminiAIConstants.Config.GENERATION_CONFIG, generationConfig);
        body.put(
                GeminiAIConstants.Config.CONTENTS,
                Collections.singletonList(
                        Collections.singletonMap(
                                GeminiAIConstants.Config.PARTS,
                                Collections.singletonList(Collections.singletonMap(GeminiAIConstants.Config.TEXT, prompt))
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException( "Error call model");
        }

        try {
            JsonNode root = objectMapper.readTree(resp.getBody());
            // lấy candidates[0].content.parts[0].text
            JsonNode candidates = root.path(GeminiAIConstants.JsonNode.CANDIDATES);
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode textNode = candidates
                        .get(0)
                        .path(GeminiAIConstants.JsonNode.CONTENT)
                        .path(GeminiAIConstants.JsonNode.PARTS)
                        .get(GeminiAIConstants.JsonNode.FIRST_NODE)
                        .path(GeminiAIConstants.JsonNode.TEXT);
                if (!textNode.isMissingNode()) {
                    return textNode.asText("");
                }
            }
            // Fallback 1: promptFeedback / safety?
            JsonNode safety = root.path(GeminiAIConstants.JsonNode.PROMPT_FEEDBACK);
            if (!safety.isMissingNode()) {
                throw new RuntimeException( "Missing node");
            }
            throw new RuntimeException( "No text content");
        } catch (Exception ex) {
            throw new RuntimeException( ex.getMessage());
        }
    }
}
