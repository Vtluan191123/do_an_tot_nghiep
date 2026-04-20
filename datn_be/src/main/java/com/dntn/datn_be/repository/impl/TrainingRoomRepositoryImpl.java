package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.TrainingRoomFilterRequest;
import com.dntn.datn_be.model.TrainingRoom;
import com.dntn.datn_be.repository.TrainingRoomRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TrainingRoomRepositoryImpl implements TrainingRoomRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<TrainingRoom> filter(TrainingRoomFilterRequest request) {
        StringBuilder sql = new StringBuilder("""
        SELECT tr.*
        FROM training_room tr
        LEFT JOIN subject s ON tr.subject_id = s.id
        LEFT JOIN users u ON tr.coach_id = u.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM training_room tr
        LEFT JOIN subject s ON tr.subject_id = s.id
        LEFT JOIN users u ON tr.coach_id = u.id
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter by coachId =====
        if (request.getCoachId() != null) {
            sql.append(" AND tr.coach_id = ? ");
            countSql.append(" AND tr.coach_id = ? ");
            params.add(request.getCoachId());
        }

        // ===== filter by subjectId =====
        if (request.getSubjectId() != null) {
            sql.append(" AND tr.subject_id = ? ");
            countSql.append(" AND tr.subject_id = ? ");
            params.add(request.getSubjectId());
        }

        // ===== filter by status =====
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            sql.append(" AND tr.status = ? ");
            countSql.append(" AND tr.status = ? ");
            params.add(request.getStatus());
        }

        // ===== filter by keyword (search in name or description) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (LOWER(tr.name) LIKE LOWER(?) OR LOWER(tr.description) LIKE LOWER(?)) ");
            countSql.append(" AND (LOWER(tr.name) LIKE LOWER(?) OR LOWER(tr.description) LIKE LOWER(?)) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
        }

        // ===== sort (anti SQL injection) =====
        List<String> allowedSortFields = List.of("id", "name", "max_capacity", "current_capacity", "status", "created_at", "updated_at", "coach_id", "subject_id");
        String sortBy = allowedSortFields.contains(request.getSortBy())
                ? request.getSortBy()
                : "created_at";
        String sortDirection = "ASC".equalsIgnoreCase(request.getSortDirection()) ? "ASC" : "DESC";

        sql.append(" ORDER BY tr.").append(sortBy).append(" ").append(sortDirection);

        // ===== pagination =====
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 20;
        int offset = page * size;

        sql.append(" LIMIT ? OFFSET ? ");
        params.add(size);
        params.add(offset);

        // ===== execute queries =====
        Query query = entityManager.createNativeQuery(sql.toString(), TrainingRoom.class);
        Query countQuery = entityManager.createNativeQuery(countSql.toString());

        // Set parameters
        for (int i = 0; i < params.size() - 2; i++) {
            query.setParameter(i + 1, params.get(i));
            countQuery.setParameter(i + 1, params.get(i));
        }
        query.setParameter(params.size() - 1, params.get(params.size() - 2));
        query.setParameter(params.size(), params.get(params.size() - 1));

        @SuppressWarnings("unchecked")
        List<TrainingRoom> content = query.getResultList();
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(content, pageable, total);
    }
}

