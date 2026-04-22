package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.response.BookingResponseDto;
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

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingRepositoryImpl implements BookingRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Bookings> filter(BookingFilterRequest request) {

        StringBuilder sql = new StringBuilder("""
        SELECT b.id, b.user_id, b.subject_id, b.time_slot_subject_id, b.status, b.created_at, b.updated_at
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN time_slot_subject tss ON b.time_slot_subject_id = tss.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN time_slot_subject tss ON b.time_slot_subject_id = tss.id
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
            sql.append(" AND (u.full_name LIKE ? OR s.name LIKE ? OR tss.name LIKE ?) ");
            countSql.append(" AND (u.full_name LIKE ? OR s.name LIKE ? OR tss.name LIKE ?) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        // ===== add sorting =====
        sql.append(" ORDER BY b.").append(request.getSortBy())
                .append(" ").append(request.getSortDirection());

        // ===== add pagination (SQL Server compatible) =====
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY ");

        // Create count query
        Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        // Add pagination parameters (offset, then rows count)
        long offset = (long) request.getPage() * request.getSize();
        params.add(offset);
        params.add(request.getSize());

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

    /**
     * Filter bookings with joined data from related tables (bookings, users, subject, time_slots_subject, time_slots)
     * @param request Filter request
     * @return Page of BookingResponseDto with joined data
     */
    public Page<BookingResponseDto> filterWithJoin(BookingFilterRequest request) {
        StringBuilder sql = new StringBuilder("""
        SELECT 
            b.id, 
            b.user_id, 
            COALESCE(u.full_name, 'N/A') as user_name,
            b.subject_id, 
            COALESCE(s.name, 'N/A') as subject_name,
            b.time_slot_subject_id,
            COALESCE(ts.start_time, GETDATE()) as time_slot_start,
            COALESCE(ts.end_time, GETDATE()) as time_slot_end,
            COALESCE(tss.max_capacity, 0) as max_capacity,
            COALESCE(tss.current_capacity, 0) as current_capacity,
            b.status, 
            b.created_at, 
            b.updated_at
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN subject s ON b.subject_id = s.id
        LEFT JOIN time_slots_subject tss ON b.time_slot_subject_id = tss.id
        LEFT JOIN time_slots ts ON tss.time_slots_id = ts.id
        WHERE 1=1
    """);

        StringBuilder countSql = new StringBuilder("""
        SELECT COUNT(*)
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN subject s ON b.subject_id = s.id
        LEFT JOIN time_slots_subject tss ON b.time_slot_subject_id = tss.id
        LEFT JOIN time_slots ts ON tss.time_slots_id = ts.id
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
            sql.append(" AND (u.full_name LIKE ? OR s.name LIKE ? OR ts.start_time LIKE ?) ");
            countSql.append(" AND (u.full_name LIKE ? OR s.name LIKE ? OR ts.start_time LIKE ?) ");
            String keyword = "%" + request.getKeyword() + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        // ===== add sorting =====
        sql.append(" ORDER BY b.").append(request.getSortBy())
                .append(" ").append(request.getSortDirection());

        // ===== add pagination =====
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY ");

        // Create count query
        Query countQuery = entityManager.createNativeQuery(countSql.toString());
        for (int i = 0; i < params.size(); i++) {
            countQuery.setParameter(i + 1, params.get(i));
        }
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        // Add pagination parameters
        long offset = (long) request.getPage() * request.getSize();
        params.add(offset);
        params.add(request.getSize());

        // Create main query with mapping
        Query query = entityManager.createNativeQuery(sql.toString());
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        List<Object[]> results = query.getResultList();
        List<BookingResponseDto> content = new ArrayList<>();

        for (Object[] row : results) {
            BookingResponseDto dto = BookingResponseDto.builder()
                .id(((Number) row[0]).longValue())
                .userId(((Number) row[1]).longValue())
                .userName((String) row[2])
                .subjectId(((Number) row[3]).longValue())
                .subjectName((String) row[4])
                .timeSlotSubjectId(((Number) row[5]).longValue())
                .timeSlotStart(row[6] != null ? ((Timestamp) row[6]).toLocalDateTime() : null)
                .timeSlotEnd(row[7] != null ? ((Timestamp) row[7]).toLocalDateTime() : null)
                .maxCapacity(((Number) row[8]).longValue())
                .currentCapacity(((Number) row[9]).longValue())
                .status(((Number) row[10]).intValue())
                .createdAt(row[11] != null ? ((Timestamp) row[11]).toLocalDateTime() : null)
                .updatedAt(row[12] != null ? ((Timestamp) row[12]).toLocalDateTime() : null)
                .build();
            content.add(dto);
        }

        // Create Pageable
        Pageable pageable = PageRequest.of(
            request.getPage(),
            request.getSize(),
            Sort.Direction.fromString(request.getSortDirection()),
            request.getSortBy()
        );

        return new PageImpl<>(content, pageable, total);
    }
}

