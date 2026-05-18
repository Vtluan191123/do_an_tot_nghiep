package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.StatisticsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final EntityManager entityManager;

    @Override
    public ResponseGlobalDto<Map<String, Object>> getRevenueStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Total revenue from bookings * subject prices
        try {
            String sql = "SELECT COALESCE(SUM(s.price), 0) as total_revenue " +
                    "FROM bookings b " +
                    "JOIN subject s ON b.subject_id = s.id " +
                    "WHERE b.status IN (1, 2)"; // Only confirmed and completed bookings
            
            Query query = entityManager.createNativeQuery(sql);
            Object result = query.getSingleResult();
            BigDecimal totalRevenue = result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
            
            statistics.put("totalRevenue", totalRevenue);
            
            // Monthly revenue
            String monthlySql = "SELECT TOP 12 CONVERT(VARCHAR(7), b.created_at, 120) as month, " +
                    "COALESCE(SUM(s.price), 0) as revenue " +
                    "FROM bookings b " +
                    "JOIN subject s ON b.subject_id = s.id " +
                    "WHERE b.status IN (1, 2) " +
                    "GROUP BY CONVERT(VARCHAR(7), b.created_at, 120) " +
                    "ORDER BY month DESC";
            
            Query monthlyQuery = entityManager.createNativeQuery(monthlySql);
            List<Object[]> monthlyResults = monthlyQuery.getResultList();
            
            List<Map<String, Object>> monthlyData = new ArrayList<>();
            for (Object[] row : monthlyResults) {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", row[0]);
                monthData.put("revenue", row[1]);
                monthlyData.add(monthData);
            }
            statistics.put("monthlyRevenue", monthlyData);
            
        } catch (Exception e) {
            statistics.put("totalRevenue", BigDecimal.ZERO);
            statistics.put("monthlyRevenue", new ArrayList<>());
        }
        
        return ResponseGlobalDto.<Map<String, Object>>builder()
                .status(HttpStatus.OK.value())
                .data(statistics)
                .message("Get revenue statistics successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Object> getTopCombos(Integer limit) {
        try {
            String sql = "SELECT c.id, c.code, c.name, c.prices, COUNT(o.id) as purchase_count " +
                    "FROM combo c " +
                    "LEFT JOIN orders o ON c.id = o.combo_id AND o.order_type = 'COMBO' AND o.payment_status = 'SUCCESS' " +
                    "GROUP BY c.id, c.code, c.name, c.prices " +
                    "ORDER BY purchase_count DESC " +
                    "OFFSET 0 ROWS FETCH NEXT ? ROWS ONLY";
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, limit);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> topCombos = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> combo = new HashMap<>();
                combo.put("id", row[0]);
                combo.put("code", row[1]);
                combo.put("name", row[2]);
                combo.put("price", row[3]);
                combo.put("purchaseCount", row[4] != null ? ((Number) row[4]).intValue() : 0);
                topCombos.add(combo);
            }
            
            return ResponseGlobalDto.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .data(topCombos)
                    .message("Get top combos successfully")
                    .build();
            
        } catch (Exception e) {
            return ResponseGlobalDto.<Object>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .data(new ArrayList<>())
                    .message("Error getting top combos: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<Object> getTopSubjects(Integer limit) {
        try {
            String sql = "SELECT s.id, s.name, s.price, COUNT(o.id) as purchase_count " +
                    "FROM subject s " +
                    "LEFT JOIN orders o ON s.id = o.subject_id AND o.order_type = 'SUBJECT' AND o.payment_status = 'SUCCESS' " +
                    "GROUP BY s.id, s.name, s.price " +
                    "ORDER BY purchase_count DESC " +
                    "OFFSET 0 ROWS FETCH NEXT ? ROWS ONLY";
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, limit);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> topSubjects = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> subject = new HashMap<>();
                subject.put("id", row[0]);
                subject.put("name", row[1]);
                subject.put("price", row[2]);
                subject.put("purchaseCount", row[3] != null ? ((Number) row[3]).intValue() : 0);
                topSubjects.add(subject);
            }
            
            return ResponseGlobalDto.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .data(topSubjects)
                    .message("Get top subjects successfully")
                    .build();
            
        } catch (Exception e) {
            return ResponseGlobalDto.<Object>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .data(new ArrayList<>())
                    .message("Error getting top subjects: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ResponseGlobalDto<Map<String, Object>> getStatisticsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Total bookings
            String bookingSql = "SELECT COUNT(*) FROM bookings";
            Query bookingQuery = entityManager.createNativeQuery(bookingSql);
            summary.put("totalBookings", bookingQuery.getSingleResult());
            
            // Total users
            String userSql = "SELECT COUNT(*) FROM users";
            Query userQuery = entityManager.createNativeQuery(userSql);
            summary.put("totalUsers", userQuery.getSingleResult());
            
            // Total subjects
            String subjectSql = "SELECT COUNT(*) FROM subject";
            Query subjectQuery = entityManager.createNativeQuery(subjectSql);
            summary.put("totalSubjects", subjectQuery.getSingleResult());
            
            // Total combos
            String comboSql = "SELECT COUNT(*) FROM combo";
            Query comboQuery = entityManager.createNativeQuery(comboSql);
            summary.put("totalCombos", comboQuery.getSingleResult());
            
            // Revenue from completed/confirmed bookings
            String revenueSql = "SELECT COALESCE(SUM(s.price), 0) FROM bookings b " +
                    "JOIN subject s ON b.subject_id = s.id WHERE b.status IN (1, 2)";
            Query revenueQuery = entityManager.createNativeQuery(revenueSql);
            summary.put("totalRevenue", revenueQuery.getSingleResult());
            
        } catch (Exception e) {
            summary.put("error", e.getMessage());
        }
        
        return ResponseGlobalDto.<Map<String, Object>>builder()
                .status(HttpStatus.OK.value())
                .data(summary)
                .message("Get statistics summary successfully")
                .build();
    }
}

