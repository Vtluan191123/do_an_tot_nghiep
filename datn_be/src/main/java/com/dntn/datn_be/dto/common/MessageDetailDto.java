package com.dntn.datn_be.dto.common;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDetailDto {
    private String type; // text|image|icon|video
    private Object content; //if text = text else url
    private String emote;
    private List<String> urlFiles; //image //video
}
