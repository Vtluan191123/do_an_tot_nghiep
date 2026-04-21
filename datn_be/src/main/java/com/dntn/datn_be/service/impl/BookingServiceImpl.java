package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.request.BookingCreateRequest;
import com.dntn.datn_be.dto.request.BookingFilterRequest;
import com.dntn.datn_be.dto.request.BookingUpdateRequest;
import com.dntn.datn_be.model.Bookings;
import com.dntn.datn_be.model.TimeSlotsSubject;
import com.dntn.datn_be.model.UserSubject;
import com.dntn.datn_be.repository.BookingRepository;
import com.dntn.datn_be.repository.TimeSlotsSubjectRepository;
import com.dntn.datn_be.repository.UserRepository;
import com.dntn.datn_be.repository.UserSubjectRepository;
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
    private final TimeSlotsSubjectRepository timeSlotsSubjectRepository;
    private final UserSubjectRepository userSubjectRepository;

    @Override
    public ResponseGlobalDto<Bookings> create(BookingCreateRequest request) throws IOException {
        //check user_subject
        UserSubject userSubject = userSubjectRepository.findBySubjectIdAndUserId(request.getSubjectId(), request.getUserId());
        if(userSubject==null){
            throw new RuntimeException("User is not enrolled in the subject");
        }

        if(userSubject.getTotal() <= 0) {
            throw new RuntimeException("Bạn đã hết số buổi tập vui lòng mua thêm gói tập để tiếp tục đặt lịch");
        }

        //check booking đã đặt giờ đó chưa
        Bookings bookingExit = bookingRepository.findByUserIdAndTimeSlotSubjectId(
                request.getUserId(),
                request.getTimeSlotSubjectId()
        );
        if(bookingExit != null) {
            throw new RuntimeException("Bạn đã đặt lịch cho khung giờ này rồi");
        }

        //check timeSlotSubject
        TimeSlotsSubject timeSlotSubject = timeSlotsSubjectRepository.findById(request.getTimeSlotSubjectId()).orElse(null);
        if (timeSlotSubject != null) {
            if(timeSlotSubject.getCurrentCapacity() >= timeSlotSubject.getMaxCapacity()) {
                return ResponseGlobalDto.<Bookings>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .data(null)
                        .message("Time slot is full")
                        .build();
            }
        }

        Bookings booking = Bookings.builder()
                .userId(request.getUserId())
                .subjectId(request.getSubjectId())
                .timeSlotSubjectId(request.getTimeSlotSubjectId())
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
    @Transactional
    public ResponseGlobalDto<Bookings> update(BookingUpdateRequest request) {

        // 1. Tìm booking
        Bookings booking = bookingRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 2. Lấy status cũ & mới
        Integer oldStatus = booking.getStatus();
        Integer newStatus = request.getStatus();

        // 3. Nếu status không đổi thì return luôn
        if (newStatus != null && newStatus.equals(oldStatus)) {
            return ResponseGlobalDto.<Bookings>builder()
                    .status(HttpStatus.OK.value())
                    .data(booking)
                    .message("Status is unchanged")
                    .build();
        }

        // 4. Validate user - subject
        Long userId = request.getUserId() != null ? request.getUserId() : booking.getUserId();
        Long subjectId = request.getSubjectId() != null ? request.getSubjectId() : booking.getSubjectId();

        UserSubject userSubject = userSubjectRepository
                .findBySubjectIdAndUserId(subjectId, userId);

        if (userSubject == null) {
            throw new RuntimeException("User is not enrolled in the subject");
        }

        // 5. Validate timeslot
        Long timeSlotSubjectId = request.getTimeSlotSubjectId() != null
                ? request.getTimeSlotSubjectId()
                : booking.getTimeSlotSubjectId();

        TimeSlotsSubject timeSlotSubject = timeSlotsSubjectRepository
                .findById(timeSlotSubjectId)
                .orElseThrow(() -> new RuntimeException("Time slot subject not found"));

        // 6. Update booking fields
        if (request.getUserId() != null) {
            booking.setUserId(request.getUserId());
        }
        if (request.getSubjectId() != null) {
            booking.setSubjectId(request.getSubjectId());
        }
        if (request.getTimeSlotSubjectId() != null) {
            booking.setTimeSlotSubjectId(request.getTimeSlotSubjectId());
        }
        if (newStatus != null) {
            booking.setStatus(newStatus);
        }

        // 7. Business logic theo status
        if (newStatus != null) {
            switch (newStatus) {
                case 1: // ví dụ: CONFIRMED
                    userSubject.setTotal(userSubject.getTotal() - 1);
                    timeSlotSubject.setCurrentCapacity(
                            timeSlotSubject.getCurrentCapacity() + 1
                    );
                    break;

                case 2: // ví dụ: CANCELLED
                    userSubject.setTotal(userSubject.getTotal() + 1);
                    timeSlotSubject.setCurrentCapacity(
                            timeSlotSubject.getCurrentCapacity() - 1
                    );
                    break;

                default:
                    break;
            }
        }

        // 8. Save (cuối cùng)
        bookingRepository.save(booking);
        userSubjectRepository.save(userSubject);
        timeSlotsSubjectRepository.save(timeSlotSubject);

        // 9. Response
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

