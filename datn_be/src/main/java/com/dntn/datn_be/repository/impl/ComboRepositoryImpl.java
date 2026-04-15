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
        SELECT DISTINCT c.*
        FROM combo c
        LEFT JOIN combo_subject cs ON c.id = cs.combo_id
        LEFT JOIN subject s ON cs.subject_id = s.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(DISTINCT c.id)
        FROM combo c
        LEFT JOIN combo_subject cs ON c.id = cs.combo_id
        LEFT JOIN subject s ON cs.subject_id = s.id
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
            sql.append(" AND LOWER(c.code) LIKE ? ");
            countSql.append(" AND LOWER(c.code) LIKE ? ");
            params.add("%" + request.getCode().toLowerCase() + "%");
        }

        // ===== filter by subjectId =====
        if (request.getSubjectId() != null) {
            sql.append(" AND cs.subject_id = ? ");
            countSql.append(" AND cs.subject_id = ? ");
            params.add(request.getSubjectId());
        }

        // ===== filter by subjectName =====
        if (request.getSubjectName() != null && !request.getSubjectName().isEmpty()) {
            sql.append(" AND LOWER(s.name) LIKE ? ");
            countSql.append(" AND LOWER(s.name) LIKE ? ");
            params.add("%" + request.getSubjectName().toLowerCase() + "%");
        }

        // ===== filter by keyword (search in code, name, description and subject name) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (LOWER(c.code) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(c.description) LIKE ? OR LOWER(s.name) LIKE ?) ");
            countSql.append(" AND (LOWER(c.code) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(c.description) LIKE ? OR LOWER(s.name) LIKE ?) ");
            String keyword = "%" + request.getKeyword().toLowerCase() + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        // ===== filter by fromDate =====
        if (request.getFromDate() != null && !request.getFromDate().isBlank()) {
            sql.append(" AND c.created_at >= ? ");
            countSql.append(" AND c.created_at >= ? ");
            params.add(java.sql.Timestamp.valueOf(request.getFromDate()));
        }

        // ===== filter by toDate =====
        if (request.getToDate() != null && !request.getToDate().isBlank()) {
            sql.append(" AND c.created_at <= ? ");
            countSql.append(" AND c.created_at <= ? ");
            params.add(java.sql.Timestamp.valueOf(request.getToDate()));
        }

        // ===== add sorting =====
        sql.append(" ORDER BY c.").append(request.getSortBy())
                .append(" ").append(request.getSortDirection());

        // ===== add SQL Server pagination (OFFSET...ROWS FETCH) =====
        long offset = (long) request.getPage() * request.getSize();
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY ");

        // Create count query
        Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        @SuppressWarnings("all")
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        // Add pagination parameters
        params.add(offset);
        params.add((long) request.getSize());

        // Create main query
        Query query = entityManager.createNativeQuery(sql.toString(), Combo.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        @SuppressWarnings("unchecked")
        List<Combo> content = query.getResultList();

        return new PageImpl<>(content, request.toPageable(), total);
    }
}

