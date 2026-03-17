package com.dntn.datn_be.constants;

public class GeminiAIConstants {
    public interface Connection {
        String URL_FORMAT = "%s/models/%s:generateContent?key=%s";
    }

    public interface Parse {
        String DETERMINISTIC = "temperature";
    }

    public interface Config {
        String MAX_OUTPUT_TOKEN = "maxOutputTokens";
        String GENERATION_CONFIG = "generationConfig";
        String CONTENTS = "contents";
        String PARTS = "parts";
        String TEXT = "text";
    }

    public interface JsonNode {
        String CANDIDATES = "candidates";
        String PROMPT_FEEDBACK = "promptFeedback";
        String CONTENT = "content";
        String PARTS = "parts";
        String TEXT = "text";
        Integer FIRST_NODE = 0;
    }
}
