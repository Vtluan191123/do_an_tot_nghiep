package com.dntn.datn_be.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class AiTrainingDto {
    private String topicCode;
    private String question;
    private List<AnswerItemDto> answer;
    @JsonProperty("isTraining")
    private boolean isTraining;
}
