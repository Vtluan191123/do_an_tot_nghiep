package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.common.SocketDataGlobal;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.dto.response.UserResponse;
import com.dntn.datn_be.model.GroudMessageUser;
import com.dntn.datn_be.model.NotificationType;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoAddFriend;
import com.dntn.datn_be.model.mongo.BaseMongoGroud;
import com.dntn.datn_be.repository.GroudMessageUserRepository;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoAddFriendRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoGroudRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.NotificationService;
import com.dntn.datn_be.service.UserService;
import com.dntn.datn_be.service.WebSocketService;
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
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;
    private final String ENTITY = "UserServiceImpl";


    @Override
    public ResponseGlobalDto<UserResponse> create(UserCreateRequest request) {
        Users user = Users.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .password(request.getPassword())
                .email(request.getEmail())
                .age(request.getAge())
                .description(request.getDescription())
                .address(request.getAddress())
                .exp(request.getExp())
                .phoneNumber(request.getPhoneNumber())
                .imagesUrl(request.getImagesUrl())
                .voteStar(request.getVoteStar())
                .roleId(request.getRoleId())
                .build();

        userRepository.save(user);
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(user, userResponse);

        return ResponseGlobalDto.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(userResponse)
                .message("Create user successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<UserResponse>> gets(UserFilterRequest request) {
        Users currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        boolean isAdmin = request.isAdmin();
        Page<Users> page = userRepository.filter(request);
        List<Users> usersList = page.getContent();
        List<UserResponse> userResponses = new ArrayList<>();
        BeanUtils.copyProperties(page, usersList);

        if(!isAdmin){
        // Get all friend requests
        List<BaseMongoAddFriend> allFriendRequests = this.baseMongoAddFriendRepository
                .findByUserAddOrUserReceiver(currentUserId, currentUserId);

        // Create map of userId -> statusFriend for quick lookup
        // Also track who sent the request
        Map<Long, Integer> userStatusMap = new HashMap<>();
        Map<Long, Boolean> userSentByMeMap = new HashMap<>();  // true = I sent it, false = they sent it

        for (BaseMongoAddFriend friendRequest : allFriendRequests) {
            Long otherUserId;
            Integer status = friendRequest.getStatus();
            Boolean sentByMe;

            // Determine other user ID and who sent the request
            if (currentUserId.equals(friendRequest.getUserAdd().longValue())) {
                // I sent the request
                otherUserId = friendRequest.getUserReceiver().longValue();
                sentByMe = true;
            } else if (currentUserId.equals(friendRequest.getUserReceiver().longValue())) {
                // They sent the request to me
                otherUserId = friendRequest.getUserAdd().longValue();
                sentByMe = false;
            } else {
                continue;
            }

            // Map status: 1 = accepted friends, 0 = pending requests
            if (status == 1) {
                userStatusMap.put(otherUserId, 1);  // Accepted friend
                userSentByMeMap.put(otherUserId, sentByMe);
            } else if (status == 0) {
                userStatusMap.put(otherUserId, 0);  // Pending request
                userSentByMeMap.put(otherUserId, sentByMe);  // Track who sent it
            }
        }

        // Convert all users to UserResponse with statusFriend and sentByMe, excluding current user
         userResponses = usersList.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> {
                    UserResponse userResponse = new UserResponse();
                    BeanUtils.copyProperties(user, userResponse);
                    // Set statusFriend: null/0/1
                    userResponse.setStatusFriend(userStatusMap.get(user.getId()));
                    // Set sentByMe if there's a pending request
                    if (userStatusMap.containsKey(user.getId())) {
                        userResponse.setSentByMe(userSentByMeMap.get(user.getId()));
                    }
                    return userResponse;
                })
                .collect(Collectors.toList());
}
        return ResponseGlobalDto.<List<UserResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(userResponses)
                .count(page.getTotalElements())
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
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getDescription() != null) user.setDescription(request.getDescription());
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
        
        // Create notification
        Users userSend = userRepository.findById(Long.valueOf(userAddId)).orElse(null);
        Users userReceiver = userRepository.findById(Long.valueOf(userReceiverId)).orElse(null);
        
        if (userSend != null && userReceiver != null) {
            try {
                ResponseGlobalDto notificationResponse = notificationService.createNotification(
                        userSend,
                        userReceiver,
                        NotificationType.FRIEND_REQUEST,
                        "Lời mời kết bạn",
                        userSend.getUsername() + " đã gửi cho bạn một lời mời kết bạn",
                        null  // relatedEntityId - không cần lưu
                );
                
                // Send socket message
                Map<String, Object> map = new HashMap<>();
                map.put("userSend", userSend);
                map.put("userReceiver", userReceiver);
                
                SocketDataGlobal data = SocketDataGlobal.builder()
                        .type("friend_request")
                        .metadata(map)
                        .notify((com.dntn.datn_be.dto.response.NotificationResponse) notificationResponse.getData())
                        .build();
                
                String topicGlobal = String.format("global/%s", userReceiver.getId());
                this.webSocketService.sendMessage(topicGlobal, data, null);
            } catch (Exception e) {
                // Log error but don't fail the operation
                e.printStackTrace();
            }
        }
        
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
        
        // Create notification for friend accept
        Users userReceive = userRepository.findById(Long.valueOf(userReceiverId)).orElse(null);
        Users userAdder = userRepository.findById(Long.valueOf(userAddId)).orElse(null);
        
        if (userReceive != null && userAdder != null) {
            try {
                ResponseGlobalDto notificationResponse = notificationService.createNotification(
                        userReceive,
                        userAdder,
                        NotificationType.FRIEND_ACCEPTED,
                        "Đã chấp nhận lời mời kết bạn",
                        userReceive.getUsername() + " đã chấp nhận lời mời kết bạn của bạn",
                        null  // relatedEntityId - không cần lưu
                );
                
                // Send socket message
                Map<String, Object> map = new HashMap<>();
                map.put("userReceive", userReceive);
                map.put("userAdder", userAdder);
                map.put("groudId", baseMongoGroud.getId());
                
                SocketDataGlobal data = SocketDataGlobal.builder()
                        .type("friend_accepted")
                        .metadata(map)
                        .notify((com.dntn.datn_be.dto.response.NotificationResponse) notificationResponse.getData())
                        .build();
                
                String topicGlobal = String.format("global/%s", userAdder.getId());
                this.webSocketService.sendMessage(topicGlobal, data, null);
            } catch (Exception e) {
                // Log error but don't fail the operation
                e.printStackTrace();
            }
        }

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
