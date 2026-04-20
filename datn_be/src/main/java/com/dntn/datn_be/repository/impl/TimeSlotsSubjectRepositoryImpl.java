package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.model.TimeSlotsSubject;
import com.dntn.datn_be.repository.TimeSlotsSubjectRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TimeSlotsSubjectRepositoryImpl implements TimeSlotsSubjectRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<TimeSlotsSubject> filter(TimeSlotsSubjectFilterRequest request) {
        StringBuilder sql = new StringBuilder("""
        SELECT tss.*
        FROM time_slots_subject tss
        LEFT JOIN time_slots ts ON tss.time_slots_id = ts.id
        LEFT JOIN subject s ON tss.subject_id = s.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM time_slots_subject tss
        LEFT JOIN time_slots ts ON tss.time_slots_id = ts.id
        LEFT JOIN subject s ON tss.subject_id = s.id
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter by coachId (required) =====
        if (request.getCoachId() != null) {
            sql.append(" AND tss.coach_id = ? ");
            countSql.append(" AND tss.coach_id = ? ");
            params.add(request.getCoachId());
        } else {
            throw new IllegalArgumentException("Coach ID is required");
        }

        // ===== filter by subjectId =====
        if (request.getSubjectId() != null) {
            sql.append(" AND tss.subject_id = ? ");
            countSql.append(" AND tss.subject_id = ? ");
            params.add(request.getSubjectId());
        }

        // ===== filter by trainingMethods =====
        if (request.getTrainingMethods() != null && !request.getTrainingMethods().isEmpty()) {
            sql.append(" AND tss.training_methods = ? ");
            countSql.append(" AND tss.training_methods = ? ");
            params.add(request.getTrainingMethods());
        }

        // ===== filter by date =====
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            sql.append(" AND ts.date = ? ");
            countSql.append(" AND ts.date = ? ");
            params.add(LocalDate.parse(request.getDate()));
        }

        // ===== filter by status =====
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            LocalDate today = LocalDate.now();

            if (request.getStatus().equals("past")) {
                sql.append(" AND ts.date < ? ");
                countSql.append(" AND ts.date < ? ");
                params.add(today);
            } else if (request.getStatus().equals("available")) {
                sql.append(" AND ts.date >= ? AND tss.current_capacity < tss.max_capacity ");
                countSql.append(" AND ts.date >= ? AND tss.current_capacity < tss.max_capacity ");
                params.add(today);
            } else if (request.getStatus().equals("full")) {
                sql.append(" AND ts.date >= ? AND tss.current_capacity >= tss.max_capacity ");
                countSql.append(" AND ts.date >= ? AND tss.current_capacity >= tss.max_capacity ");
                params.add(today);
            }
        }

        // ===== sort (anti SQL injection) =====
        List<String> allowedSortFields = List.of("date", "start_time", "training_methods", "max_capacity", "current_capacity");

        String sortBy = allowedSortFields.contains(request.getSortBy())
                ? request.getSortBy()
                : "date";

        String sortDir = "asc".equalsIgnoreCase(request.getSortDirection()) ? "ASC" : "DESC";

        sql.append(" ORDER BY ").append(sortBy).append(" ").append(sortDir);

        // ===== create query =====
        Query query = entityManager.createNativeQuery(sql.toString(), TimeSlotsSubject.class);
        Query countQuery = entityManager.createNativeQuery(countSql.toString());

        // ===== set params =====
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
            countQuery.setParameter(i + 1, params.get(i));
        }

        // ===== get total count =====
        Number totalCount = (Number) countQuery.getSingleResult();
        long total = totalCount.longValue();

        // ===== pagination =====
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        int offset = page * size;

        query.setFirstResult(offset);
        query.setMaxResults(size);

        List<TimeSlotsSubject> resultList = query.getResultList();

        Pageable pageable = PageRequest.of(page, size);

        return new PageImpl<>(resultList, pageable, total);
    }
}

