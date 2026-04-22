package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.AiTrainingAnswerFilterRequest;
import com.dntn.datn_be.model.AiTrainingAnswer;
import com.dntn.datn_be.repository.AiTrainingAnswerRepositoryCustom;
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
public class AiTrainingAnswerRepositoryImpl implements AiTrainingAnswerRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<AiTrainingAnswer> search(AiTrainingAnswerFilterRequest request) {
        
        // ===== Build SQL =====
        StringBuilder sql = new StringBuilder("""
        SELECT a.*
        FROM ai_training_answer a
        WHERE 1=1
    """);
        
        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM ai_training_answer a
        WHERE 1=1
    """);
        
        List<Object> params = new ArrayList<>();
        
        // ===== Filter by id =====
        if (request.getId() != null) {
            sql.append(" AND a.id = ? ");
            countSql.append(" AND a.id = ? ");
            params.add(request.getId());
        }
        
        // ===== Filter by question id =====
        if (request.getQuestionId() != null) {
            sql.append(" AND a.question_id = ? ");
            countSql.append(" AND a.question_id = ? ");
            params.add(request.getQuestionId());
        }
        
        // ===== Filter by type =====
        if (request.getType() != null && !request.getType().isEmpty()) {
            sql.append(" AND LOWER(a.type) = ? ");
            countSql.append(" AND LOWER(a.type) = ? ");
            params.add(request.getType().toLowerCase());
        }
        
        // ===== Filter by position =====
        if (request.getPosition() != null) {
            sql.append(" AND a.position = ? ");
            countSql.append(" AND a.position = ? ");
            params.add(request.getPosition());
        }
        
        // ===== Add sorting =====
        String sortBy = request.getSortBy() != null && !request.getSortBy().isEmpty() ? request.getSortBy() : "position";
        String sortDirection = request.getSortDirection() != null && request.getSortDirection().equalsIgnoreCase("asc") ? "ASC" : "DESC";
        sql.append(" ORDER BY a.").append(sortBy).append(" ").append(sortDirection);
        
        // ===== Add pagination (SQL Server syntax) =====
        Pageable pageable = request.toPageable();
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY ");
        
        // ===== Execute count query =====
        jakarta.persistence.Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        Object countResult = countQuery.getSingleResult();
        Long total = convertToLong(countResult);
        
        // ===== Execute data query =====
        jakarta.persistence.Query dataQuery = entityManager.createNativeQuery(sql.toString(), AiTrainingAnswer.class);
        for (int i = 0; i < params.size(); i++) {
            dataQuery.setParameter(i + 1, params.get(i));
        }
        dataQuery.setParameter(params.size() + 1, pageable.getOffset());
        dataQuery.setParameter(params.size() + 2, pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<AiTrainingAnswer> content = dataQuery.getResultList();
        
        return new PageImpl<>(content, pageable, total);
    }
    
    private Long convertToLong(Object result) {
        if (result instanceof Long) {
            return (Long) result;
        } else if (result instanceof Number) {
            return ((Number) result).longValue();
        } else {
            return 0L;
        }
    }
}

