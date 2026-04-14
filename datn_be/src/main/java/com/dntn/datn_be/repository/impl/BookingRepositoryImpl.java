package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.model.Bookings;
import com.dntn.datn_be.repository.BookingRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingRepositoryImpl implements BookingRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Bookings> filter(BookingFilterRequest request) {

        StringBuilder sql = new StringBuilder("""
        SELECT b.*
        FROM bookings b
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM bookings b
        WHERE 1=1
    """);

        List<Object> params = new ArrayList<>();

        // ===== filter by id =====
        if (request.getId() != null) {
            sql.append(" AND b.id = ? ");
            countSql.append(" AND b.id = ? ");
            params.add(request.getId());
        }

        // ===== filter by userId =====
        if (request.getUserId() != null) {
            sql.append(" AND b.user_id = ? ");
            countSql.append(" AND b.user_id = ? ");
            params.add(request.getUserId());
        }

        // ===== filter by subjectId =====
        if (request.getSubjectId() != null) {
            sql.append(" AND b.subject_id = ? ");
            countSql.append(" AND b.subject_id = ? ");
            params.add(request.getSubjectId());
        }

        // ===== filter by keyword (search in related tables) =====
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            sql.append(" AND (b.id LIKE ? OR b.status LIKE ?) ");
            countSql.append(" AND (b.id LIKE ? OR b.status LIKE ?) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
        }

        // ===== add sorting =====
        sql.append(" ORDER BY b.").append(request.getSortBy())
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
        Query query = entityManager.createNativeQuery(sql.toString(), Bookings.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        List<Bookings> content = query.getResultList();

        // Create Pageable from request parameters
        Pageable pageable = PageRequest.of(
            request.getPage(), 
            request.getSize(),
            Sort.Direction.fromString(request.getSortDirection()),
            request.getSortBy()
        );

        return new PageImpl<>(content, pageable, total);
    }
}

