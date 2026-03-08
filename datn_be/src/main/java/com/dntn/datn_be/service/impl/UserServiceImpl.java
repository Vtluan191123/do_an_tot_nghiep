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
    private EntityManager entityManager;
    private final String ENTITY = "UserServiceImpl";


    @Override
    public ResponseGlobalDto<User> create(UserCreateRequest request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<List<User>> gets(Long request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<User> get(List<Long> request) {
        return null;
    }

    @Override
    public ResponseGlobalDto<User> update(UserUpdateRequest request) {
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

        String queryString = """
            SELECT 
                u.id,
                u.username,
                u.email,
                u.age,
                u.address,
                u.exp,
                u.phone_number,
                u.images_url,
                u.vote_star,
                u.created_at,
                gmu.groud_id
            FROM users u
            JOIN groud_message_user gmu
                ON u.id = gmu.user_id
            WHERE gmu.groud_id IN (
                SELECT groud_id
                FROM groud_message_user
                WHERE user_id = :userId
            )
            AND u.id <> :userId
        """;

        Query query = entityManager.createNativeQuery(queryString);
        query.setParameter("userId", userId);

        List<Object[]> results = query.getResultList();

        List<GetListGroudsDto.UserDetailGroudDto> userDetailGroudDtos = new ArrayList<>();

        for (Object[] row : results) {

            GetListGroudsDto.UserDetailGroudDto dto =
                    GetListGroudsDto.UserDetailGroudDto.builder()
                            .id(((Number) row[0]).longValue())
                            .username((String) row[1])
                            .email((String) row[2])
                            .age(row[3] != null ? row[3].toString() : null)
                            .address((String) row[4])
                            .exp((String) row[5])
                            .phoneNumber((String) row[6])
                            .imagesUrl((String) row[7])
                            .voteStar(row[8] != null ? ((Number) row[8]).intValue() : null)
                            .createdAt(row[9] != null ? ((java.sql.Timestamp) row[9]).toLocalDateTime() : null)
                            .groudId((String) row[10])
                            .build();
            userDetailGroudDtos.add(dto);
        }

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
