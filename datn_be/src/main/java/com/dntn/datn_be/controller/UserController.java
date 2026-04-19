package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.dto.request.AssignCoachRoleRequest;
import com.dntn.datn_be.dto.response.RoleResponse;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.dto.response.EnrolledSubjectResponse;
import com.dntn.datn_be.service.UserService;
import com.dntn.datn_be.service.UserEnrolledSubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/user/")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserEnrolledSubjectService userEnrolledSubjectService;

    // ================== CREATE ==================
    @PostMapping
    public ResponseGlobalDto<UserResponse> create(@RequestBody UserCreateRequest request) throws IOException {
        return userService.create(request);
    }

    // ================== GET LIST ==================
    @PostMapping("/search")
    public ResponseGlobalDto<List<UserResponse>> gets(@RequestBody UserFilterRequest request) throws IOException {
        return userService.gets(request);
    }

    // ================== GET ROLES FOR FILTER ==================
    @GetMapping("/role")
    public ResponseGlobalDto<List<RoleResponse>> getRoles() {
        return userService.getRoles();
    }

    // ================== GET BY ID ==================
    @GetMapping("/{id}")
    public ResponseGlobalDto<UserResponse> get(@PathVariable Long id) {
        UserFilterRequest request = new UserFilterRequest();
        request.setId(id);
        return userService.get(request);
    }

    // ================== UPDATE ==================
    @PutMapping
    public ResponseGlobalDto<UserResponse> update(@RequestBody UserUpdateRequest request) {
        return userService.update(request);
    }

    // ================== DELETE ONE ==================
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return userService.delete(id);
    }

    // ================== DELETE MULTI ==================
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return userService.deletes(ids);
    }

    // ================== ASSIGN COACH ROLE ==================
    @PostMapping("/assign-coach-role")
    public ResponseGlobalDto<Boolean> assignCoachRole(@RequestBody AssignCoachRoleRequest request) {
        return userService.assignCoachRole(request);
    }

    // ================== GET USER COACH SUBJECTS ==================
    @GetMapping("/{userId}/coach-subjects")
    public ResponseGlobalDto<List<Long>> getUserCoachSubjects(@PathVariable Long userId) {
        return userService.getUserCoachSubjects(userId);
    }

    // ================== GET ALL COACHES WITH SUBJECTS ==================
    @GetMapping("/coaches/all")
    public ResponseGlobalDto<?> getAllCoachesWithSubjects() {
        return userService.getAllCoachesWithSubjects();
    }

    // ================== GET USER ENROLLED SUBJECTS ==================
    @GetMapping("/{userId}/enrolled-subjects")
    public ResponseGlobalDto<List<EnrolledSubjectResponse>> getUserEnrolledSubjects(@PathVariable Long userId) {
        List<EnrolledSubjectResponse> enrolledSubjects = userEnrolledSubjectService.getEnrolledSubjects(userId);
        return ResponseGlobalDto.<List<EnrolledSubjectResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(enrolledSubjects)
                .count((long) enrolledSubjects.size())
                .message("Get enrolled subjects successfully")
                .build();
    }
}
