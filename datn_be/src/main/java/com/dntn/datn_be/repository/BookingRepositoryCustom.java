package com.dntn.datn_be.repository;

import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.model.Bookings;
import org.springframework.data.domain.Page;

public interface BookingRepositoryCustom {
    Page<Bookings> filter(BookingFilterRequest request);
}

