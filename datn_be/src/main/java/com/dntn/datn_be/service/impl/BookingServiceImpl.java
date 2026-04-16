package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.BookingCreateRequest;
import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.request.BookingUpdateRequest;
import com.dntn.datn_be.model.Bookings;
import com.dntn.datn_be.repository.BookingRepository;
import com.dntn.datn_be.service.BookingService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public ResponseGlobalDto<Bookings> create(BookingCreateRequest request) throws IOException {
        Bookings booking = Bookings.builder()
                .userId(request.getUserId())
                .subjectId(request.getSubjectId())
                .timeSlotId(request.getTimeSlotId())
                .status(request.getStatus())
                .build();

        bookingRepository.save(booking);

        return ResponseGlobalDto.<Bookings>builder()
                .status(HttpStatus.CREATED.value())
                .data(booking)
                .message("Create booking successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<List<Bookings>> gets(BookingFilterRequest request) {
        Page<Bookings> page = bookingRepository.filter(request);

        return ResponseGlobalDto.<List<Bookings>>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent())
                .count(page.getTotalElements())
                .build();
    }

    @Override
    public ResponseGlobalDto<Bookings> get(BookingFilterRequest request) {
        Page<Bookings> page = bookingRepository.filter(request);

        if (page.isEmpty()) {
            return ResponseGlobalDto.<Bookings>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Booking not found")
                    .build();
        }

        return ResponseGlobalDto.<Bookings>builder()
                .status(HttpStatus.OK.value())
                .data(page.getContent().get(0))
                .message("Get booking successfully")
                .build();
    }

    @Override
    public ResponseGlobalDto<Bookings> update(BookingUpdateRequest request) {
        Bookings booking = bookingRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Update fields if not null
        if (request.getUserId() != null) booking.setUserId(request.getUserId());
        if (request.getSubjectId() != null) booking.setSubjectId(request.getSubjectId());
        if (request.getTimeSlotId() != null) booking.setTimeSlotId(request.getTimeSlotId());
        if (request.getStatus() != null) booking.setStatus(request.getStatus());

        bookingRepository.save(booking);

        return ResponseGlobalDto.<Bookings>builder()
                .status(HttpStatus.OK.value())
                .data(booking)
                .message("Update booking successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> delete(Long request) {
        Bookings booking = bookingRepository.findById(request)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        bookingRepository.delete(booking);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete booking successfully")
                .build();
    }

    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deletes(List<Long> request) {
        List<Bookings> bookings = bookingRepository.findAllById(request);

        if (bookings.isEmpty()) {
            throw new RuntimeException("Bookings not found");
        }

        bookingRepository.deleteAll(bookings);

        return ResponseGlobalDto.<Boolean>builder()
                .status(HttpStatus.OK.value())
                .data(true)
                .message("Delete bookings successfully")
                .build();
    }
}

