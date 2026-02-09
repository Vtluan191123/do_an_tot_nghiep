package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.model.Users;
import org.apache.catalina.User;

import java.util.List;
import java.util.Objects;

public interface UserService {
    ResponseGlobalDto<Users> getBy(Objects request);
    ResponseGlobalDto<List<Users>> getsBy(Objects request);
    ResponseGlobalDto<Boolean> update(LoginRequest request);
    ResponseGlobalDto<Boolean> deleteBy(LoginRequest request);
}
