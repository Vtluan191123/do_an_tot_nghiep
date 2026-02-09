package com.dntn.datn_be.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    String accessToken;
    String refreshToken;
}
