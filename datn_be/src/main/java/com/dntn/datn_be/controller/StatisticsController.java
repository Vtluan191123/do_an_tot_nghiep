package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Get revenue statistics
     */
    @GetMapping("/revenue")
    public ResponseGlobalDto<Map<String, Object>> getRevenueStatistics() {
        return statisticsService.getRevenueStatistics();
    }

    /**
     * Get top sold combos
     */
    @GetMapping("/top-combos")
    public ResponseGlobalDto<Object> getTopCombos(
            @RequestParam(defaultValue = "10") Integer limit) {
        return statisticsService.getTopCombos(limit);
    }

    /**
     * Get top sold subjects
     */
    @GetMapping("/top-subjects")
    public ResponseGlobalDto<Object> getTopSubjects(
            @RequestParam(defaultValue = "10") Integer limit) {
        return statisticsService.getTopSubjects(limit);
    }

    /**
     * Get all statistics in one call
     */
    @GetMapping("/summary")
    public ResponseGlobalDto<Map<String, Object>> getStatisticsSummary() {
        return statisticsService.getStatisticsSummary();
    }
}

