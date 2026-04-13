package com.dntn.datn_be.service;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.NotificationResponse;
import com.dntn.datn_be.model.NotificationType;
import com.dntn.datn_be.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /**
     * Tạo thông báo mới
     */
    ResponseGlobalDto<NotificationResponse> createNotification(
            Users userSend,
            Users userReceiver,
            NotificationType type,
            String title,
            String content,
            Long relatedEntityId
    );

    /**
     * Lấy tất cả thông báo của người dùng hiện tại
     */
    ResponseGlobalDto<List<NotificationResponse>> getNotifications();

    /**
     * Lấy thông báo có phân trang
     */
    ResponseGlobalDto<Page<NotificationResponse>> getNotificationsWithPagination(Pageable pageable);

    /**
     * Lấy thông báo chưa đọc
     */
    ResponseGlobalDto<List<NotificationResponse>> getUnreadNotifications();

    /**
     * Đếm số thông báo chưa đọc
     */
    ResponseGlobalDto<Long> countUnreadNotifications();

    /**
     * Đánh dấu thông báo là đã đọc
     */
    ResponseGlobalDto<Boolean> markAsRead(Long notificationId);

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    ResponseGlobalDto<Boolean> markAllAsRead();

    /**
     * Xóa thông báo
     */
    ResponseGlobalDto<Boolean> deleteNotification(Long notificationId);

    /**
     * Xóa tất cả thông báo
     */
    ResponseGlobalDto<Boolean> deleteAllNotifications();

    /**
     * Lấy thông báo theo loại
     */
    ResponseGlobalDto<List<NotificationResponse>> getNotificationsByType(NotificationType type);
}

