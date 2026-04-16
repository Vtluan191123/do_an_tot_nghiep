package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssignCoachRoleRequest {
    
    private Long userId;
    
    private Long roleId;  // Vai trò sẽ được gán cho user
    
    private List<Long> subjectIds;  // Danh sách môn học mà coach sẽ dạy (null nếu không phải coach)
}

