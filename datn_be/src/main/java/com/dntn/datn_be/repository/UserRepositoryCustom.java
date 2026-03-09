package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.response.GetListGroudsDto;

import java.util.List;

public interface UserRepositoryCustom {
    List<GetListGroudsDto.UserDetailGroudDto> userDetailGroudDtos(Long userId);
}
