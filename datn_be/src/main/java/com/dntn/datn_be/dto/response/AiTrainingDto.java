package com.dntn.datn_be.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class AiTrainingDto {
    private String topicCode;
    private String question;
    private List<AnswerItemDto> answer;
    private boolean isTrained;
}
