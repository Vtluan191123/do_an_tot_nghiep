package com.dntn.datn_be.dto.common;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResponseGlobalDto<T> {
    Object message;
    T data;
    String error;
    Integer status;
    Integer count;
}
