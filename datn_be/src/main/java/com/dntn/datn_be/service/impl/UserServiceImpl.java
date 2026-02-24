package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.SubjectCreateRequest;
import com.dntn.datn_be.dto.request.SubjectUpdateRequest;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.service.UserService;
import org.apache.catalina.User;

import java.util.List;

public class UserServiceImpl implements UserService{
    @Override
    public ResponseGlobalDto<User> create(UserCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<User>> gets(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<User> get(List<Long> request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<User> update(UserUpdateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        return null;
    }
}
