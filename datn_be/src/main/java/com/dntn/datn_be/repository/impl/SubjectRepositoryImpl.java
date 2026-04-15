package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.SubjectRepositoryCustom;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubjectRepositoryImpl implements SubjectRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Subject> filter(SubjectFilterRequest request, Pageable pageable) {
        
        // ===== Build SQL =====
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
        
        // ===== Filter by id =====
        if (request.getId() != null) {
            sql.append(" AND s.id = ? ");
            countSql.append(" AND s.id = ? ");
            params.add(request.getId());
        }
        
        // ===== Filter by status =====
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            sql.append(" AND s.status = ? ");
            countSql.append(" AND s.status = ? ");
            params.add(request.getStatus());
        }
        
        // ===== Filter by keyword (search in name and description) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (LOWER(s.name) LIKE ? OR LOWER(s.description) LIKE ?) ");
            countSql.append(" AND (LOWER(s.name) LIKE ? OR LOWER(s.description) LIKE ?) ");
            String keyword = "%" + request.getKeyword().toLowerCase().trim() + "%";
            params.add(keyword);
            params.add(keyword);
        }
        
        // ===== Filter by fromDate =====
        if (request.getFromDate() != null && !request.getFromDate().isBlank()) {
            // Convert date string to timestamp: yyyy-MM-dd -> yyyy-MM-dd 00:00:00
            String fromDateStr = request.getFromDate();
            if (!fromDateStr.contains(" ")) {
                fromDateStr += " 00:00:00";
            }
            sql.append(" AND s.created_at >= ? ");
            countSql.append(" AND s.created_at >= ? ");
            params.add(java.sql.Timestamp.valueOf(fromDateStr));
        }
        
        // ===== Filter by toDate =====
        if (request.getToDate() != null && !request.getToDate().isBlank()) {
            // Convert date string to timestamp: yyyy-MM-dd -> yyyy-MM-dd 23:59:59
            String toDateStr = request.getToDate();
            if (!toDateStr.contains(" ")) {
                toDateStr += " 23:59:59";
            }
            sql.append(" AND s.created_at <= ? ");
            countSql.append(" AND s.created_at <= ? ");
            params.add(java.sql.Timestamp.valueOf(toDateStr));
        }
        
        // ===== Add sorting =====
        String sortBy = pageable.getSort().stream()
            .findFirst()
            .map(org.springframework.data.domain.Sort.Order::getProperty)
            .orElse("id");
        String sortDirection = pageable.getSort().stream()
            .findFirst()
            .map(order -> order.isAscending() ? "ASC" : "DESC")
            .orElse("DESC");
        
        sql.append(" ORDER BY s.").append(sortBy).append(" ").append(sortDirection);
        
        // ===== Add pagination (SQL Server syntax) =====
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY ");
        
        // ===== Execute count query =====
        jakarta.persistence.Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        Object countResult = countQuery.getSingleResult();
        Long total;
        if (countResult instanceof Long) {
            total = (Long) countResult;
        } else if (countResult instanceof Number) {
            total = ((Number) countResult).longValue();
        } else {
            total = 0L;
        }
        
        // ===== Execute data query =====
        jakarta.persistence.Query dataQuery = entityManager.createNativeQuery(sql.toString(), Subject.class);
        for (int i = 0; i < params.size(); i++) {
            dataQuery.setParameter(i + 1, params.get(i));
        }
        dataQuery.setParameter(params.size() + 1, pageable.getOffset());
        dataQuery.setParameter(params.size() + 2, pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<Subject> content = dataQuery.getResultList();
        
        return new PageImpl<>(content, pageable, total);
    }
}

