package com.dntn.datn_be.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseGlobalDto<T> {
    Object message;
    T data;
    String error;
    Integer status;
    Integer count;
}
