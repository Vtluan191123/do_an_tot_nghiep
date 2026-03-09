package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.repository.UserRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepositoryCustom {

    private final EntityManager entityManager;
    @Override
    public List<GetListGroudsDto.UserDetailGroudDto> userDetailGroudDtos(Long userId) {
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
                gmu.groud_id,
                gmu.is_read,
                gmu.updated_at as lastMessage
            FROM users u
            JOIN groud_message_user gmu
                ON u.id = gmu.user_id
            WHERE gmu.groud_id IN (
                SELECT groud_id
                FROM groud_message_user
                WHERE user_id = :userId
            )
            AND u.id <> :userId order by gmu.updated_at desc 
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
                            .isRead((boolean) row[11])
                            .lateMessageTime(row[12] != null ? ((java.sql.Timestamp) row[12]).toLocalDateTime() : null)
                            .build();
            userDetailGroudDtos.add(dto);
        }
        return userDetailGroudDtos;
    }
}
