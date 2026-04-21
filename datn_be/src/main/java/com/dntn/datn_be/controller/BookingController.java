package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.BookingCreateRequest;
import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.request.BookingUpdateRequest;
import com.dntn.datn_be.dto.response.BookingResponseDto;
import com.dntn.datn_be.model.Bookings;
import com.dntn.datn_be.service.BookingService;
import com.dntn.datn_be.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    // ================== CREATE ==================
    /**
     * Create a new booking
     * @param request Booking creation data
     * @return Created booking
     */
    @PostMapping
    public ResponseGlobalDto<Bookings> create(@RequestBody BookingCreateRequest request) throws IOException {
        return bookingService.create(request);
    }

    // ================== GET LIST ==================
    /**
     * Get list of bookings with filter and pagination
     * @param request Filter request with pagination
     * @return List of bookings
     */
    @PostMapping("/search")
    public ResponseGlobalDto<List<Bookings>> gets(@RequestBody BookingFilterRequest request) {
        return bookingService.gets(request);
    }

    // ================== GET LIST WITH JOIN ==================
    /**
     * Get list of bookings with joined data from user, subject, and timeslot tables
     * @param request Filter request with pagination
     * @return List of BookingResponseDto with joined data
     */
    @PostMapping("/search-with-join")
    public ResponseGlobalDto<List<BookingResponseDto>> getsWithJoin(@RequestBody BookingFilterRequest request) {
        Page<BookingResponseDto> page = bookingRepository.filterWithJoin(request);

        return ResponseGlobalDto.<List<BookingResponseDto>>builder()
                .status(200)
                .data(page.getContent())
                .count(page.getTotalElements())
                .build();
    }

    // ================== GET BY ID ==================
    /**
     * Get booking by ID
     * @param id Booking ID
     * @return Booking details
     */
    @GetMapping("/{id}")
    public ResponseGlobalDto<Bookings> get(@PathVariable Long id) {
        BookingFilterRequest request = new BookingFilterRequest();
        request.setId(id);
        return bookingService.get(request);
    }

    // ================== UPDATE ==================
    /**
     * Update booking information
     * @param request Booking update data
     * @return Updated booking
     */
    @PutMapping
    public ResponseGlobalDto<Bookings> update(@RequestBody BookingUpdateRequest request) {
        return bookingService.update(request);
    }

    // ================== DELETE ONE ==================
    /**
     * Delete a booking by ID
     * @param id Booking ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseGlobalDto<Boolean> delete(@PathVariable Long id) throws Exception {
        return bookingService.delete(id);
    }

    // ================== DELETE MULTI ==================
    /**
     * Delete multiple bookings
     * @param ids List of booking IDs
     * @return Success status
     */
    @DeleteMapping
    public ResponseGlobalDto<Boolean> deletes(@RequestBody List<Long> ids) {
        return bookingService.deletes(ids);
    }
}
