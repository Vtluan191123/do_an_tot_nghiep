package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.*;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.model.Users;
import org.apache.catalina.User;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Objects;

public interface UserService extends BaseGlobalService<UserResponse, UserCreateRequest, UserFilterRequest, UserUpdateRequest,Long>{
    ResponseGlobalDto<Boolean> addFiend( Integer userAddId,Integer userReceiverId);
    ResponseGlobalDto<Boolean> acceptAddFiend(Integer userAddId,Integer userReceiverId);
    ResponseGlobalDto<Boolean> cancelFiend(Integer userAddId,Integer userReceiverId,String groudId);
    ResponseGlobalDto<GetListGroudsDto> getListGrouds(Long userId);
}
