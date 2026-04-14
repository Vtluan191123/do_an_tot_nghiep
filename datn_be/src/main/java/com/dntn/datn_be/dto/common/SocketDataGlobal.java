package com.dntn.datn_be.dto.common;

import com.dntn.datn_be.dto.response.NotificationResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class SocketDataGlobal {
    String type;
    Map<String,Object> metadata;
    NotificationResponse notify;
}
