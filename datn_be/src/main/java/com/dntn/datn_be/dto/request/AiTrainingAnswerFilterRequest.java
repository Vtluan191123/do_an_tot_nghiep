package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiTrainingAnswerFilterRequest extends BaseFilterRequest {

    private Long id;

    private Long questionId;

    private String type;

    private Integer position;
}

