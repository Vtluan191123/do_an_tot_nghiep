package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.*;
import com.dntn.datn_be.model.Users;
import org.apache.catalina.User;

import java.util.List;
import java.util.Objects;

public interface UserService extends BaseGlobalService<User, UserCreateRequest, Long, UserUpdateRequest,Long>{
}
