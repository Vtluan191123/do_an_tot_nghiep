package com.dntn.datn_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TopicDTO {
    private String code;
    private String topicName;
    private List<QuestionChildDTO> questions;
}
