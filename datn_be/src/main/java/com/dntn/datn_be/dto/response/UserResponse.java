package com.dntn.datn_be.dto.response;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.model.Users;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse extends Users {
    boolean isFriend;
}
