package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.UserFilterRequest;
import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.model.mongo.BaseMongoMessage;
import com.dntn.datn_be.repository.mongo.BaseMongoMessageRepository;
import com.dntn.datn_be.repository.UserRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepositoryCustom {

    private final EntityManager entityManager;
    private final BaseMongoMessageRepository baseMongoMessageRepository;
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
            String groudId = (String) row[10];

            // Lấy thông tin tin nhắn cuối cùng từ MongoDB
            String latestMessageContent = null;
            String latestMessageType = null;

            // Lấy tin nhắn mới nhất được sort theo date
            List<BaseMongoMessage> latestMessages = baseMongoMessageRepository.findByGroudIdOrderByCreateTimeDesc(groudId);

            if (!latestMessages.isEmpty()) {
                BaseMongoMessage latestMsg = latestMessages.get(0);
                if (latestMsg.getMessageDetail() != null) {
                    Object messageDetail = latestMsg.getMessageDetail();

                    try {
                        // Lấy type từ messageDetail - hỗ trợ cả Map (LinkedHashMap từ MongoDB) và MessageDetailDto
                        if (messageDetail instanceof java.util.Map) {
                            // Trường hợp MongoDB trả về LinkedHashMap
                            java.util.Map<String, Object> detailMap = (java.util.Map<String, Object>) messageDetail;
                            latestMessageType = (String) detailMap.get("type");
                            Object contentObj = detailMap.get("content");
                            // Chỉ lấy content nếu nó là string ngắn hoặc không phải SVG/URL dài
                            if (contentObj != null) {
                                String contentStr = contentObj.toString();
                                // Nếu là SVG hoặc URL dài, không lấy content
                                if (contentStr.startsWith("<") || contentStr.startsWith("http") || contentStr.length() > 200) {
                                    latestMessageContent = null; // Sẽ hiển thị "đã gửi 1 icon" ở frontend
                                } else {
                                    latestMessageContent = contentStr;
                                }
                            }
                        } else if (messageDetail instanceof com.dntn.datn_be.dto.common.MessageDetailDto) {
                            // Trường hợp là MessageDetailDto object
                            com.dntn.datn_be.dto.common.MessageDetailDto dto =
                                    (com.dntn.datn_be.dto.common.MessageDetailDto) messageDetail;
                            latestMessageType = dto.getType();
                            Object contentObj = dto.getContent();
                            if (contentObj != null) {
                                String contentStr = contentObj.toString();
                                // Nếu là SVG hoặc URL dài, không lấy content
                                if (contentStr.startsWith("<") || contentStr.startsWith("http") || contentStr.length() > 200) {
                                    latestMessageContent = null;
                                } else {
                                    latestMessageContent = contentStr;
                                }
                            }
                        }
                    } catch (Exception e) {
                        // Log hoặc handle error nếu cần
                        latestMessageType = null;
                        latestMessageContent = null;
                    }
                }
            }

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
                            .groudId(groudId)
                            .isRead((boolean) row[11])
                            .lateMessageTime(row[12] != null ? ((java.sql.Timestamp) row[12]).toLocalDateTime() : null)
                            .latestMessageContent(latestMessageContent)
                            .latestMessageType(latestMessageType)
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

        // ===== filter by id =====
        if (request.getId() != null) {
            sql.append(" AND u.id = ? ");
            countSql.append(" AND u.id = ? ");
            params.add(request.getId());
        }

        // ===== filter roleId =====
        if (request.getRoleId() != null) {
            sql.append(" AND u.role_id = ? ");
            countSql.append(" AND u.role_id = ? ");
            params.add(request.getRoleId());
        }

        // ===== filter by isActive =====
        if (request.getIsActive() != null) {
            sql.append(" AND u.is_active = ? ");
            countSql.append(" AND u.is_active = ? ");
            params.add(request.getIsActive());
        }

        // ===== exclude specific user =====
        if (request.getExcludeUserId() != null) {
            sql.append(" AND u.id <> ? ");
            countSql.append(" AND u.id <> ? ");
            params.add(request.getExcludeUserId());
        }

        // ===== keyword - LIKE with OR in username, email, fullName =====
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            sql.append("""
            AND (
                LOWER(u.username) LIKE ?
                OR LOWER(u.email) LIKE ?
                OR LOWER(u.full_name) LIKE ?
            )
        """);

            countSql.append("""
            AND (
                LOWER(u.username) LIKE ?
                OR LOWER(u.email) LIKE ?
                OR LOWER(u.full_name) LIKE ?
            )
        """);

            String keyword = "%" + request.getKeyword().toLowerCase() + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        // ===== fromDate =====
        if (request.getFromDate() != null && !request.getFromDate().isBlank()) {
            // Convert date string to timestamp: yyyy-MM-dd -> yyyy-MM-dd 00:00:00
            String fromDateStr = request.getFromDate();
            if (!fromDateStr.contains(" ")) {
                fromDateStr += " 00:00:00";
            }
            sql.append(" AND u.created_at >= ? ");
            countSql.append(" AND u.created_at >= ? ");
            params.add(java.sql.Timestamp.valueOf(fromDateStr));
        }

        // ===== toDate =====
        if (request.getToDate() != null && !request.getToDate().isBlank()) {
            // Convert date string to timestamp: yyyy-MM-dd -> yyyy-MM-dd 23:59:59
            String toDateStr = request.getToDate();
            if (!toDateStr.contains(" ")) {
                toDateStr += " 23:59:59";
            }
            sql.append(" AND u.created_at <= ? ");
            countSql.append(" AND u.created_at <= ? ");
            params.add(java.sql.Timestamp.valueOf(toDateStr));
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
        // Get total count first
        Number totalCount = (Number) countQuery.getSingleResult();
        long total = totalCount.longValue();

        // Get pageable from request (already handles 1-based to 0-based conversion)
        Pageable pageable = request.toPageable();
        int page = pageable.getPageNumber();  // Already 0-based from toPageable()
        int size = pageable.getPageSize();

        // Calculate offset
        int offset = page * size;

        query.setFirstResult(offset);
        query.setMaxResults(size);

        List<Users> resultList = query.getResultList();

        return new PageImpl<>(
                resultList,
                pageable,
                total
        );
    }
}
