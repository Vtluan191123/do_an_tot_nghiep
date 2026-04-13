package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.dto.response.NotificationResponse;
import com.dntn.datn_be.model.Notification;
import com.dntn.datn_be.model.NotificationType;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.NotificationRepository;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    /**
     * Map Notification entity sang NotificationResponse DTO
     */
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .userSendId(notification.getUserSend().getId())
                .userSendName(notification.getUserSend().getUsername())
                .userSendUsername(notification.getUserSend().getUsername())
                .userSendAvatar(notification.getUserSend().getImagesUrl())
                .title(notification.getTitle())
                .content(notification.getContent())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }

    /**
     * Tạo thông báo mới
     */
    @Override
    @Transactional
    public ResponseGlobalDto<NotificationResponse> createNotification(
            Users userSend,
            Users userReceiver,
            NotificationType type,
            String title,
            String content,
            Long relatedEntityId) {
        try {
            Notification notification = Notification.builder()
                    .userSend(userSend)
                    .userReceiver(userReceiver)
                    .type(type)
                    .title(title)
                    .content(content)
                    .relatedEntityId(relatedEntityId)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            Notification saved = notificationRepository.save(notification);
            log.info("Notification created: {} -> {}", userSend.getId(), userReceiver.getId());

            return ResponseGlobalDto.<NotificationResponse>builder()
                    .status(HttpStatus.OK.value())
                    .data(mapToResponse(saved))
                    .message("Thông báo đã được tạo")
                    .build();
        } catch (Exception e) {
            log.error("Error creating notification", e);
            return ResponseGlobalDto.<NotificationResponse>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Lấy tất cả thông báo của người dùng hiện tại
     */
    @Override
    public ResponseGlobalDto<List<NotificationResponse>> getNotifications() {
        try {
            Users currentUser = authService.getCurrentUser();
            List<Notification> notifications = notificationRepository
                    .findByUserReceiverOrderByCreatedAtDesc(currentUser, 
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent();

            List<NotificationResponse> responses = notifications.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count(responses.size())
                    .message("Lấy danh sách thông báo thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Lấy thông báo có phân trang
     */
    @Override
    public ResponseGlobalDto<Page<NotificationResponse>> getNotificationsWithPagination(Pageable pageable) {
        try {
            Users currentUser = authService.getCurrentUser();
            Page<Notification> notifications = notificationRepository
                    .findByUserReceiverOrderByCreatedAtDesc(currentUser, pageable);

            Page<NotificationResponse> responses = notifications.map(this::mapToResponse);

            return ResponseGlobalDto.<Page<NotificationResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count(responses.getTotalElements())
                    .message("Lấy danh sách thông báo thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error getting notifications with pagination", e);
            return ResponseGlobalDto.<Page<NotificationResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Lấy thông báo chưa đọc
     */
    @Override
    public ResponseGlobalDto<List<NotificationResponse>> getUnreadNotifications() {
        try {
            Users currentUser = authService.getCurrentUser();
            List<Notification> unreadNotifications = notificationRepository
                    .findByUserReceiverAndIsReadFalse(currentUser);

            List<NotificationResponse> responses = unreadNotifications.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count(responses.size())
                    .message("Lấy thông báo chưa đọc thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error getting unread notifications", e);
            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @Override
    public ResponseGlobalDto<Long> countUnreadNotifications() {
        try {
            Users currentUser = authService.getCurrentUser();
            long count = notificationRepository.countByUserReceiverAndIsReadFalse(currentUser);

            return ResponseGlobalDto.<Long>builder()
                    .status(HttpStatus.OK.value())
                    .data(count)
                    .message("Đếm thông báo chưa đọc thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error counting unread notifications", e);
            return ResponseGlobalDto.<Long>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> markAsRead(Long notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new Exception("Thông báo không tìm thấy"));

            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);

            log.info("Notification marked as read: {}", notificationId);

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Đánh dấu thông báo là đã đọc")
                    .build();
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> markAllAsRead() {
        try {
            Users currentUser = authService.getCurrentUser();
            List<Notification> unreadNotifications = notificationRepository
                    .findByUserReceiverAndIsReadFalse(currentUser);

            LocalDateTime now = LocalDateTime.now();
            unreadNotifications.forEach(n -> {
                n.setRead(true);
                n.setReadAt(now);
            });
            notificationRepository.saveAll(unreadNotifications);

            log.info("All notifications marked as read for user: {}", currentUser.getId());

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Đánh dấu tất cả thông báo là đã đọc")
                    .build();
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Xóa thông báo
     */
    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deleteNotification(Long notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            log.info("Notification deleted: {}", notificationId);

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Thông báo đã được xóa")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Xóa tất cả thông báo
     */
    @Override
    @Transactional
    public ResponseGlobalDto<Boolean> deleteAllNotifications() {
        try {
            Users currentUser = authService.getCurrentUser();
            List<Notification> notifications = notificationRepository
                    .findByUserReceiver(currentUser);

            notificationRepository.deleteAll(notifications);
            log.info("All notifications deleted for user: {}", currentUser.getId());

            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .data(true)
                    .message("Tất cả thông báo đã được xóa")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting all notifications", e);
            return ResponseGlobalDto.<Boolean>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Lấy thông báo theo loại
     */
    @Override
    public ResponseGlobalDto<List<NotificationResponse>> getNotificationsByType(NotificationType type) {
        try {
            Users currentUser = authService.getCurrentUser();
            List<Notification> notifications = notificationRepository
                    .findByUserReceiverAndType(currentUser, type);

            List<NotificationResponse> responses = notifications.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.OK.value())
                    .data(responses)
                    .count(responses.size())
                    .message("Lấy thông báo theo loại thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error getting notifications by type", e);
            return ResponseGlobalDto.<List<NotificationResponse>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error(e.getMessage())
                    .build();
        }
    }
}

