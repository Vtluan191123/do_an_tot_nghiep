package com.dntn.datn_be.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BaseResultDTO {
    private Object message;
    private String reason;
    private boolean status = false;
    private Object data;
    private Integer count;
}
