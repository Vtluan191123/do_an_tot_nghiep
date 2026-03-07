package com.dntn.datn_be.dto.request;

import com.dntn.datn_be.dto.common.MessageDetailDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Builder
public class MessageRequest {
    private String messageId;
    @NotBlank(message = "Groud id không được trống")
    private String groudId;
    @NotNull(message = "senderId không được trống")
    private Integer senderId;
    @NotNull(message = "Message detail không được null")
    private MessageDetailRequest messageDetailRequest;
    private boolean isHide;
}
