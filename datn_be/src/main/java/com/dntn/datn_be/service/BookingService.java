package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.request.BookingCreateRequest;
import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.request.BookingUpdateRequest;
import com.dntn.datn_be.model.Bookings;

public interface BookingService extends BaseGlobalService<Bookings, BookingCreateRequest, BookingFilterRequest, BookingUpdateRequest, Long> {
}

