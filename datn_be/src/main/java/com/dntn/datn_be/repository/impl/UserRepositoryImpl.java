package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.UserRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

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

    @Override
    public Page<Users> filter(UserFilterRequest request) {

        StringBuilder sql = new StringBuilder("""
        SELECT u.*
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter roleId =====
        if (request.getRoleId() != null) {
            sql.append(" AND u.role_id = ? ");
            countSql.append(" AND u.role_id = ? ");
            params.add(request.getRoleId());
        }

        // ===== keyword =====
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            sql.append("""
            AND (
                LOWER(u.username) LIKE ?
                OR LOWER(u.email) LIKE ?
            )
        """);

            countSql.append("""
            AND (
                LOWER(u.username) LIKE ?
                OR LOWER(u.email) LIKE ?
            )
        """);

            String keyword = "%" + request.getKeyword().toLowerCase() + "%";
            params.add(keyword);
            params.add(keyword);
        }

        // ===== fromDate =====
        if (request.getFromDate() != null && !request.getFromDate().isBlank()) {
            sql.append(" AND u.created_at >= ? ");
            countSql.append(" AND u.created_at >= ? ");
            params.add(java.sql.Timestamp.valueOf(request.getFromDate()));
        }

        // ===== toDate =====
        if (request.getToDate() != null && !request.getToDate().isBlank()) {
            sql.append(" AND u.created_at <= ? ");
            countSql.append(" AND u.created_at <= ? ");
            params.add(java.sql.Timestamp.valueOf(request.getToDate()));
        }

        // ===== sort (anti SQL injection) =====
        List<String> allowedSortFields = List.of("id", "username", "email", "created_at");

        String sortBy = allowedSortFields.contains(request.getSortBy())
                ? request.getSortBy()
                : "id";

        String sortDir = "asc".equalsIgnoreCase(request.getSortDirection()) ? "ASC" : "DESC";

        sql.append(" ORDER BY u.").append(sortBy).append(" ").append(sortDir);

        // ===== create query =====
        Query query = entityManager.createNativeQuery(sql.toString(), Users.class);
        Query countQuery = entityManager.createNativeQuery(countSql.toString());

        // set params
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
            countQuery.setParameter(i + 1, params.get(i));
        }

        // ===== paging =====
        int page = request.getPage();
        int size = request.getSize();

        query.setFirstResult(page * size);
        query.setMaxResults(size);

        List<Users> resultList = query.getResultList();

        Number total = (Number) countQuery.getSingleResult();

        return new PageImpl<>(
                resultList,
                request.toPageable(),
                total.longValue()
        );
    }
}
