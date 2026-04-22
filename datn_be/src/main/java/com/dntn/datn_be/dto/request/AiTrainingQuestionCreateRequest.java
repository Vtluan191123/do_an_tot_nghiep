package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiTrainingQuestionCreateRequest {

    private Long topicId;

    private String content;

    private Integer status; // 0: no answer, 1: has answer
}

