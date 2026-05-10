package com.dntn.datn_be.dto.response;

import lombok.Data;

@Data
public class AnswerItemDto {
    private Integer position;
    private String type;
    private String content;
    private String imageUrl;  // URL for image answer (when type is 'image')
}
