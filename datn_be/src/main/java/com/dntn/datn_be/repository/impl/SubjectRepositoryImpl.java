package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.SubjectRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubjectRepositoryImpl implements SubjectRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Subject> filter(SubjectFilterRequest request) {

        StringBuilder sql = new StringBuilder("""
        SELECT s.*
        FROM subject s
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM subject s
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter by id =====
        if (request.getId() != null) {
            sql.append(" AND s.id = ? ");
            countSql.append(" AND s.id = ? ");
            params.add(request.getId());
        }

        // ===== filter by status =====
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            sql.append(" AND s.status = ? ");
            countSql.append(" AND s.status = ? ");
            params.add(request.getStatus());
        }

        // ===== filter by keyword (search in name and description) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (s.name LIKE ? OR s.description LIKE ?) ");
            countSql.append(" AND (s.name LIKE ? OR s.description LIKE ?) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
        }

        // ===== add sorting =====
        sql.append(" ORDER BY s.").append(request.getSortBy())
                .append(" ").append(request.getSortDirection());

        // ===== add pagination =====
        sql.append(" LIMIT ? OFFSET ? ");

        // Create count query
        Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        // Add pagination parameters
        params.add(request.getSize());
        params.add((long) request.getPage() * request.getSize());

        // Create main query
        Query query = entityManager.createNativeQuery(sql.toString(), Subject.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        List<Subject> content = query.getResultList();

        return new PageImpl<>(content, request.toPageable(), total);
    }
}

