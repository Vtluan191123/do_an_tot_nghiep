package com.dntn.datn_be.controller;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.NotificationResponse;
import com.dntn.datn_be.model.NotificationType;
import com.dntn.datn_be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy tất cả thông báo
     */
    @GetMapping
    public ResponseEntity<ResponseGlobalDto<List<NotificationResponse>>> getNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications());
    }

    /**
     * Lấy thông báo có phân trang
     */
    @GetMapping("/paginated")
    public ResponseEntity<ResponseGlobalDto<Page<NotificationResponse>>> getNotificationsWithPagination(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(notificationService.getNotificationsWithPagination(pageable));
    }

    /**
     * Lấy thông báo chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<ResponseGlobalDto<List<NotificationResponse>>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ResponseGlobalDto<Long>> countUnreadNotifications() {
        return ResponseEntity.ok(notificationService.countUnreadNotifications());
    }

    /**
     * Lấy thông báo theo loại
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ResponseGlobalDto<List<NotificationResponse>>> getNotificationsByType(
            @PathVariable NotificationType type) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(type));
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseGlobalDto<Boolean>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @PutMapping("/read-all")
    public ResponseEntity<ResponseGlobalDto<Boolean>> markAllAsRead() {
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }

    /**
     * Xóa thông báo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseGlobalDto<Boolean>> deleteNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.deleteNotification(id));
    }

    /**
     * Xóa tất cả thông báo
     */
    @DeleteMapping("/delete-all")
    public ResponseEntity<ResponseGlobalDto<Boolean>> deleteAllNotifications() {
        return ResponseEntity.ok(notificationService.deleteAllNotifications());
    }
}

