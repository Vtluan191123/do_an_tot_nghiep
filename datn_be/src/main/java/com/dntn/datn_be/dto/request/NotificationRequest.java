package com.dntn.datn_be.dto.request;

import com.dntn.datn_be.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để gửi thông báo qua WebSocket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    /**
     * Loại thông báo: MESSAGE, FRIEND_REQUEST, FRIEND_ACCEPTED, OTHER
     */
    private NotificationType type;

    /**
     * ID người gửi
     */
    private Long userSendId;

    /**
     * ID người nhận
     */
    private Long userReceiverId;

    /**
     * Tiêu đề thông báo
     */
    private String title;

    /**
     * Nội dung thông báo
     */
    private String content;

    /**
     * ID của entity liên quan (message ID, friend request ID, etc)
     */
    private Long relatedEntityId;
}

