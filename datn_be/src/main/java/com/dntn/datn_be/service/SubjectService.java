package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.SubjectCreateRequest;
import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.dto.request.SubjectUpdateRequest;
import com.dntn.datn_be.model.Subject;

public interface SubjectService extends BaseGlobalService<Subject, SubjectCreateRequest, SubjectFilterRequest, SubjectUpdateRequest, Long>{
}
