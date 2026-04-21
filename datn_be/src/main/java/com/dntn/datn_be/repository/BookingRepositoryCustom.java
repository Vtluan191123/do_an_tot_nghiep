package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.response.BookingResponseDto;
import com.dntn.datn_be.model.Bookings;
import org.springframework.data.domain.Page;

public interface BookingRepositoryCustom {
    Page<Bookings> filter(BookingFilterRequest request);
    
    /**
     * Filter bookings with joined data from related tables
     * @param request Filter request
     * @return Page of BookingResponseDto with joined data
     */
    Page<BookingResponseDto> filterWithJoin(BookingFilterRequest request);
}

