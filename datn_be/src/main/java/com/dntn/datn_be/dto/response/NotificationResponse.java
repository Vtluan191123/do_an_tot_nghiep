package com.dntn.datn_be.dto.response;

import com.dntn.datn_be.model.NotificationType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    /**
     * ID thông báo
     */
    private Long id;

    /**
     * Loại thông báo
     */
    private NotificationType type;

    /**
     * Tên người gửi
     */
    private String userSendName;

    /**
     * Username người gửi
     */
    private String userSendUsername;

    /**
     * Avatar người gửi
     */
    private String userSendAvatar;

    /**
     * ID người gửi
     */
    private Long userSendId;

    /**
     * Tiêu đề thông báo
     */
    private String title;

    /**
     * Nội dung thông báo
     */
    private String content;

    /**
     * ID của entity liên quan
     */
    private Long relatedEntityId;

    /**
     * Trạng thái đã đọc
     */
    private boolean isRead;

    /**
     * Thời gian tạo thông báo
     */
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Thời gian đã đọc
     */
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime readAt;
}

