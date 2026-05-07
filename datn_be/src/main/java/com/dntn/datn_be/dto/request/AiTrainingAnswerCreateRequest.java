package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiTrainingAnswerCreateRequest {

    private Long questionId;

    private String type; // text or image

    private String content;

    private Integer position;

    private MultipartFile imageFile; // Thay thế imageUrl
}

