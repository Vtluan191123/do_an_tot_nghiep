package com.dntn.datn_be.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@Builder
public class MessageDetailRequest {
    private String type; // text|image|icon|video
    private Object content; //if text = text else url
    private String emote;
    private List<MultipartFile> files; //image //video
}
