package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.model.GroudMessageUser;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoAddFriend;
import com.dntn.datn_be.model.mongo.BaseMongoGroud;
import com.dntn.datn_be.repository.GroudMessageUserRepository;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoAddFriendRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoGroudRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.UserService;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import org.apache.catalina.User;
import org.hibernate.ObjectNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService{
    private final BaseMongoAddFriendRepository baseMongoAddFriendRepository;
    private final BaseMongoGroudRepository baseMongoGroudRepository;
    private final GroudMessageUserRepository groudMessageUserRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final String ENTITY = "UserServiceImpl";


    @Override
    public ResponseGlobalDto<UserResponse> create(UserCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<UserResponse>> gets(UserFilterRequest request) {
        Users currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        Page<Users> page = userRepository.filter(request);
        List<Users> usersList = page.getContent();

        // Get all accepted friends (status == 1) from DB
        List<BaseMongoAddFriend> acceptedFriends = this.baseMongoAddFriendRepository
                .findByUserAddOrUserReceiver(currentUserId, currentUserId).stream()
                .filter(friend -> friend.getStatus() == 1)
                .toList();

        // Extract friend IDs for quick lookup
        Set<Long> friendUserIds = acceptedFriends.stream()
                .map(baseMongoAddFriend -> {
                    if (currentUserId.equals(baseMongoAddFriend.getUserAdd().longValue())) {
                        return baseMongoAddFriend.getUserReceiver().longValue();
                    } else if (currentUserId.equals(baseMongoAddFriend.getUserReceiver().longValue())) {
                        return baseMongoAddFriend.getUserAdd().longValue();
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Convert all users to UserResponse with friend flag, excluding current user
        List<UserResponse> userResponses = usersList.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> {
                    UserResponse userResponse = new UserResponse();
                    BeanUtils.copyProperties(user, userResponse);
                    // Check if this user is a friend
                    userResponse.setFriend(friendUserIds.contains(user.getId()));
                    return userResponse;
                })
                .collect(Collectors.toList());

        return ResponseGlobalDto.<List<UserResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(userResponses)
                .count(userResponses.size())
                .build();
    }


    @Override
    public ResponseGlobalDto<UserResponse> get(UserFilterRequest request) {
        Optional<Users> usersOptional = this.userRepository.findById(request.getId());
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(usersOptional.get(), userResponse);
        return ResponseGlobalDto.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .data(userResponse)
                .message("Get user ById Successfully").build();
    }

    @Override
    public ResponseGlobalDto<UserResponse> update(UserUpdateRequest request) {
        Users user = userRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // update từng field nếu != null
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getExp() != null) user.setExp(request.getExp());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getImagesUrl() != null) user.setImagesUrl(request.getImagesUrl());

        if (request.getVoteStar() != null) {
            user.setVoteStar(request.getVoteStar()); // convert Long -> Integer
        }

        if (request.getRoleId() != null) {
            user.setRoleId(request.getRoleId());
        }

        userRepository.save(user);
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(user, userResponse);
        return ResponseGlobalDto.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .data(userResponse)
                .message("Update user Successfully").build();
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        Users user = userRepository.findById(request)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("delete user Successfully").build();
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        List<Users> users = userRepository.findAllById(request);

        if (users.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteAll(users);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("delete user Successfully").build();
    }

    @Override
    public ResponseGlobalDto<Boolean> addFiend(Integer userAddId, Integer userReceiverId) {
        BaseMongoAddFriend baseMongoAddFriend = new BaseMongoAddFriend();
        baseMongoAddFriend.setUserAdd(userAddId);
        baseMongoAddFriend.setUserReceiver(userReceiverId);
        baseMongoAddFriend.setStatus(0);
        this.baseMongoAddFriendRepository.save(baseMongoAddFriend);
        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Thêm bạn bè thành công")
                .build();
    }

    @Override
    public ResponseGlobalDto<Boolean> acceptAddFiend(Integer userAddId, Integer userReceiverId) {
        BaseMongoAddFriend baseMongoAddFriend = this.baseMongoAddFriendRepository.findByUserAddAndUserReceiver(userAddId, userReceiverId);

        if(baseMongoAddFriend != null){
            baseMongoAddFriend.setStatus(1);
            this.baseMongoAddFriendRepository.save(baseMongoAddFriend);
        }else {
            throw new ObjectNotFoundException(ENTITY,BaseMongoAddFriend.class);
        }

        // tạo groud message
        String nameGroud = String.format("groudFriend_%s_%s",userAddId,userReceiverId);
        BaseMongoGroud baseMongoGroud = BaseMongoGroud.builder()
                .type(MessageConstants.GroudType.FRIEND)
                .name(nameGroud)
                .description(null)
                .quantity(2)
                .build();
        this.baseMongoGroudRepository.save(baseMongoGroud);

        GroudMessageUser groudMessageUserAdd = GroudMessageUser.builder()
                .groudId(baseMongoGroud.getId())
                .userId(userAddId)
                .build();
        this.groudMessageUserRepository.save(groudMessageUserAdd);

        GroudMessageUser groudMessageUserReceiver = GroudMessageUser.builder()
                .groudId(baseMongoGroud.getId())
                .userId(userReceiverId)
                .build();
        this.groudMessageUserRepository.save(groudMessageUserReceiver);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Chấp nhận bạn bè thành công")
                .build();
    }


    @Override
    public ResponseGlobalDto<Boolean> cancelFiend(Integer userAddId, Integer userReceiverId, String groudId) {
        BaseMongoAddFriend baseMongoAddFriend = this.baseMongoAddFriendRepository.findByUserAddAndUserReceiver(userAddId, userReceiverId);
        if(baseMongoAddFriend != null){
            this.baseMongoAddFriendRepository.delete(baseMongoAddFriend);
        }else {
            throw new ObjectNotFoundException(ENTITY,BaseMongoAddFriend.class);
        }

        //xóa groud
        List<GroudMessageUser> groudMessageUser = this.groudMessageUserRepository.findByGroudId(groudId);
        if(!groudMessageUser.isEmpty()){
            this.groudMessageUserRepository.deleteAll(groudMessageUser);
        }
        Optional<BaseMongoGroud> baseMongoGroudOptional = this.baseMongoGroudRepository.findById(groudId);
        baseMongoGroudOptional.ifPresent(this.baseMongoGroudRepository::delete);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Hủy bạn bè thành công")
                .build();
    }

    @Override
    public ResponseGlobalDto<GetListGroudsDto> getListGrouds(Long userId) {

        List<GetListGroudsDto.UserDetailGroudDto> userDetailGroudDtos = this.userRepository.userDetailGroudDtos(userId);

        GetListGroudsDto getListGroudsDto = GetListGroudsDto.builder()
                .userId(userId)
                .userDetailGroudDto(userDetailGroudDtos)
                .build();

        return ResponseGlobalDto.<GetListGroudsDto>builder()
                .status(HttpStatus.OK.value())
                .data(getListGroudsDto)
                .count(userDetailGroudDtos.size())
                .build();
    }


}
