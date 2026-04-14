package com.dntn.datn_be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    private Long id;

    private String username;

    private String fullName;

    private String email;

    private String age;

    private String description;

    private String address;

    private String exp;

    private String phoneNumber;

    private String imagesUrl;

    private Long voteStar;

    private Long roleId;
}
