package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiTrainingAnswerUpdateRequest {

    private Long id;

    private Long questionId;

    private String type; // text or image

    private String content;

    private Integer position;
}

