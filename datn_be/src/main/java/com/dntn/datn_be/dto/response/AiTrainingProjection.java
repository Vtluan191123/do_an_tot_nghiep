package com.dntn.datn_be.dto.response;

public interface AiTrainingProjection {
    String getCode();
    String getTopicName();
    String getQuestion();
    String getAnswer();
    String getType();
    Integer getPosition();
}
