package com.dntn.datn_be.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class GetListGroudsDto {
    private Long userId;
    private List<UserDetailGroudDto> userDetailGroudDto;

    @Getter
    @Setter
    @Builder
    public static class UserDetailGroudDto{
        private Long id;

        private String username;

        private String email;

        private String age;

        private String address;

        private String exp;

        private String phoneNumber;

        private String imagesUrl;

        private Integer voteStar;

        private String groudId;

        private LocalDateTime createdAt; //thời gian user đc tạo

        private LocalDateTime lateMessageTime;

        private boolean isRead;
    }

}
