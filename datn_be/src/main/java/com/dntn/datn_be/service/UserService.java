package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.*;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.dto.response.RoleResponse;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.dto.response.CoachDetailResponse;
import com.dntn.datn_be.dto.response.UserSearchWithCurrentUserResponse;

import java.util.List;

public interface UserService extends BaseGlobalService<UserResponse, UserCreateRequest, UserFilterRequest, UserUpdateRequest,Long>{
    ResponseGlobalDto<Boolean> addFiend( Integer userAddId,Integer userReceiverId);
    ResponseGlobalDto<Boolean> acceptAddFiend(Integer userAddId,Integer userReceiverId);
    ResponseGlobalDto<Boolean> cancelFiend(Integer userAddId,Integer userReceiverId,String groudId);
    ResponseGlobalDto<GetListGroudsDto> getListGrouds(Long userId);
    ResponseGlobalDto<List<RoleResponse>> getRoles();
    ResponseGlobalDto<Boolean> assignCoachRole(AssignCoachRoleRequest request);
    ResponseGlobalDto<List<Long>> getUserCoachSubjects(Long userId);
    ResponseGlobalDto<List<CoachDetailResponse>> getAllCoachesWithSubjects();
    ResponseGlobalDto<UserSearchWithCurrentUserResponse> searchWithCurrentUser(UserFilterRequest request);
}
