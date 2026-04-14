package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import java.util.Map;

public interface StatisticsService {
    ResponseGlobalDto<Map<String, Object>> getRevenueStatistics();
    ResponseGlobalDto<Object> getTopCombos(Integer limit);
    ResponseGlobalDto<Object> getTopSubjects(Integer limit);
    ResponseGlobalDto<Map<String, Object>> getStatisticsSummary();
}

