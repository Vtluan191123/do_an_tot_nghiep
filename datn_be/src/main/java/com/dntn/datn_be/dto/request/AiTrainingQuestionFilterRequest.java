package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiTrainingQuestionFilterRequest extends BaseFilterRequest {

    private Long id;

    private Long topicId;

    private String content;

    private Integer status;
}

