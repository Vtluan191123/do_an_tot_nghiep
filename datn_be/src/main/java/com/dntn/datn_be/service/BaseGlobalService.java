package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.LoginRequest;
import com.dntn.datn_be.model.Users;

import java.util.List;
import java.util.Objects;

public interface BaseGlobalService<T,CR,GR,UR,DR> {
    ResponseGlobalDto<T> create(CR request);
    ResponseGlobalDto<List<T>> gets(GR request);
    ResponseGlobalDto<T> get(List<GR> request);
    ResponseGlobalDto<T> update(UR request);
    ResponseGlobalDto<Boolean> delete(DR request);
    ResponseGlobalDto<Boolean> deletes(List<DR> request);
}
