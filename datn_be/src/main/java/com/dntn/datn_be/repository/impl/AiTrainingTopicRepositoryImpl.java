package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.AiTrainingTopicFilterRequest;
import com.dntn.datn_be.model.AiTrainingTopic;
import com.dntn.datn_be.repository.AiTrainingTopicRepositoryCustom;
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
public class AiTrainingTopicRepositoryImpl implements AiTrainingTopicRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<AiTrainingTopic> search(AiTrainingTopicFilterRequest request) {
        
        // ===== Build SQL =====
        StringBuilder sql = new StringBuilder("""
        SELECT t.*
        FROM ai_training_topic t
        WHERE 1=1
    """);
        
        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM ai_training_topic t
        WHERE 1=1
    """);
        
        List<Object> params = new ArrayList<>();
        
        // ===== Filter by id =====
        if (request.getId() != null) {
            sql.append(" AND t.id = ? ");
            countSql.append(" AND t.id = ? ");
            params.add(request.getId());
        }
        
        // ===== Filter by topic name =====
        if (request.getTopicName() != null && !request.getTopicName().isEmpty()) {
            sql.append(" AND LOWER(t.topic_name) LIKE ? ");
            countSql.append(" AND LOWER(t.topic_name) LIKE ? ");
            params.add("%" + request.getTopicName().toLowerCase().trim() + "%");
        }
        
        // ===== Filter by code =====
        if (request.getCode() != null && !request.getCode().isEmpty()) {
            sql.append(" AND LOWER(t.code) LIKE ? ");
            countSql.append(" AND LOWER(t.code) LIKE ? ");
            params.add("%" + request.getCode().toLowerCase().trim() + "%");
        }
        
        // ===== Add sorting =====
        String sortBy = request.getSortBy() != null && !request.getSortBy().isEmpty() ? request.getSortBy() : "id";
        String sortDirection = request.getSortDirection() != null && request.getSortDirection().equalsIgnoreCase("asc") ? "ASC" : "DESC";
        sql.append(" ORDER BY t.").append(sortBy).append(" ").append(sortDirection);
        
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
        jakarta.persistence.Query dataQuery = entityManager.createNativeQuery(sql.toString(), AiTrainingTopic.class);
        for (int i = 0; i < params.size(); i++) {
            dataQuery.setParameter(i + 1, params.get(i));
        }
        dataQuery.setParameter(params.size() + 1, pageable.getOffset());
        dataQuery.setParameter(params.size() + 2, pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<AiTrainingTopic> content = dataQuery.getResultList();
        
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

