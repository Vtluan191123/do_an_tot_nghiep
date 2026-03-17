package com.dntn.datn_be.gemini.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "spring.gemini")
public class GeminiAIProperties {

    private String apiKey;
    private String baseUrl;
    private String primaryModel;
    private String fallbackModel;

    public GeminiAIProperties() {}

    public GeminiAIProperties(String apiKey, String baseUrl, String primaryModel, String fallbackModel) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.primaryModel = primaryModel;
        this.fallbackModel = fallbackModel;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getPrimaryModel() {
        return primaryModel;
    }

    public void setPrimaryModel(String primaryModel) {
        this.primaryModel = primaryModel;
    }

    public String getFallbackModel() {
        return fallbackModel;
    }

    public void setFallbackModel(String fallbackModel) {
        this.fallbackModel = fallbackModel;
    }
}
