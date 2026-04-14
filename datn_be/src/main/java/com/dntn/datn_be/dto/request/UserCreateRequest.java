package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateRequest {
    
    private String username;
    
    private String fullName;
    
    private String password;
    
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
