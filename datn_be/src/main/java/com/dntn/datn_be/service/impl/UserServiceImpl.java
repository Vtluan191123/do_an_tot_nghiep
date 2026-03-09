package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.constants.MessageConstants;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.UserCreateRequest;
import com.dntn.datn_be.dto.request.UserUpdateRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.model.GroudMessageUser;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoAddFriend;
import com.dntn.datn_be.model.mongo.BaseMongoGroud;
import com.dntn.datn_be.repository.GroudMessageUserRepository;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoAddFriendRepository;
import com.dntn.datn_be.repository.mongo.BaseMongoGroudRepository;
import com.dntn.datn_be.service.UserService;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import org.apache.catalina.User;
import org.hibernate.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService{
    private final BaseMongoAddFriendRepository baseMongoAddFriendRepository;
    private final BaseMongoGroudRepository baseMongoGroudRepository;
    private final GroudMessageUserRepository groudMessageUserRepository;
    private final UserRepository userRepository;
    private final String ENTITY = "UserServiceImpl";


    @Override
    public ResponseGlobalDto<Users> create(UserCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<Users>> gets(Long request) {
        Optional<Users> usersOptional = this.userRepository.findById(request);
        return ResponseGlobalDto.<List<Users>>builder()
                .status(HttpStatus.OK.value())
                .data(List.of(usersOptional.orElse(null)))
                .message("Get user ById Successfully").build();
    }


    @Override
    public ResponseGlobalDto<Users> get(List<Long> request) {
        return null;
    }


    @Override
    public ResponseGlobalDto<Users> update(UserUpdateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> delete(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        return null;
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
