package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.model.Users;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserRepositoryCustom {
    List<GetListGroudsDto.UserDetailGroudDto> userDetailGroudDtos(Long userId);
    Page<Users> filter(UserFilterRequest request);
}
