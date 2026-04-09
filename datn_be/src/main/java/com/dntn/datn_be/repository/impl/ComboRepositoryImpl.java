package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.ComboFilterRequest;
import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.repository.ComboRepositoryCustom;
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
public class ComboRepositoryImpl implements ComboRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Combo> filter(ComboFilterRequest request) {

        StringBuilder sql = new StringBuilder("""
        SELECT c.*
        FROM combo c
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM combo c
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter by id =====
        if (request.getId() != null) {
            sql.append(" AND c.id = ? ");
            countSql.append(" AND c.id = ? ");
            params.add(request.getId());
        }

        // ===== filter by code =====
        if (request.getCode() != null && !request.getCode().isEmpty()) {
            sql.append(" AND c.code = ? ");
            countSql.append(" AND c.code = ? ");
            params.add(request.getCode());
        }

        // ===== filter by keyword (search in name and description) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (c.name LIKE ? OR c.description LIKE ?) ");
            countSql.append(" AND (c.name LIKE ? OR c.description LIKE ?) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
        }

        // ===== add sorting =====
        sql.append(" ORDER BY c.").append(request.getSortBy())
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
        Query query = entityManager.createNativeQuery(sql.toString(), Combo.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        List<Combo> content = query.getResultList();

        return new PageImpl<>(content, request.toPageable(), total);
    }
}

