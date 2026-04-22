package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.AiTrainingQuestionFilterRequest;
import com.dntn.datn_be.model.AiTrainingQuestion;
import com.dntn.datn_be.repository.AiTrainingQuestionRepositoryCustom;
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
public class AiTrainingQuestionRepositoryImpl implements AiTrainingQuestionRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<AiTrainingQuestion> search(AiTrainingQuestionFilterRequest request) {
        
        // ===== Build SQL =====
        StringBuilder sql = new StringBuilder("""
        SELECT q.*
        FROM ai_training_question q
        WHERE 1=1
    """);
        
        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM ai_training_question q
        WHERE 1=1
    """);
        
        List<Object> params = new ArrayList<>();
        
        // ===== Filter by id =====
        if (request.getId() != null) {
            sql.append(" AND q.id = ? ");
            countSql.append(" AND q.id = ? ");
            params.add(request.getId());
        }
        
        // ===== Filter by topic id =====
        if (request.getTopicId() != null) {
            sql.append(" AND q.topic_id = ? ");
            countSql.append(" AND q.topic_id = ? ");
            params.add(request.getTopicId());
        }
        
        // ===== Filter by content =====
        if (request.getContent() != null && !request.getContent().isEmpty()) {
            sql.append(" AND LOWER(q.content) LIKE ? ");
            countSql.append(" AND LOWER(q.content) LIKE ? ");
            params.add("%" + request.getContent().toLowerCase().trim() + "%");
        }
        
        // ===== Filter by status =====
        if (request.getStatus() != null) {
            sql.append(" AND q.status = ? ");
            countSql.append(" AND q.status = ? ");
            params.add(request.getStatus());
        }
        
        // ===== Add sorting =====
        String sortBy = request.getSortBy() != null && !request.getSortBy().isEmpty() ? request.getSortBy() : "id";
        String sortDirection = request.getSortDirection() != null && request.getSortDirection().equalsIgnoreCase("asc") ? "ASC" : "DESC";
        sql.append(" ORDER BY q.").append(sortBy).append(" ").append(sortDirection);
        
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
        jakarta.persistence.Query dataQuery = entityManager.createNativeQuery(sql.toString(), AiTrainingQuestion.class);
        for (int i = 0; i < params.size(); i++) {
            dataQuery.setParameter(i + 1, params.get(i));
        }
        dataQuery.setParameter(params.size() + 1, pageable.getOffset());
        dataQuery.setParameter(params.size() + 2, pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<AiTrainingQuestion> content = dataQuery.getResultList();
        
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

