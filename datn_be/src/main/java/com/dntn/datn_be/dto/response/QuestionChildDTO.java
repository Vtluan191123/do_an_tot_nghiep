package com.dntn.datn_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionChildDTO {
    private String question;
    private List<AnswerDTO> answers;
}
