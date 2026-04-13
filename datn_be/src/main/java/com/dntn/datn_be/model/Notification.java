package com.dntn.datn_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Loại thông báo: MESSAGE, FRIEND_REQUEST, FRIEND_ACCEPTED, etc
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    /**
     * Người gửi thông báo
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_send_id", nullable = false)
    private Users userSend;

    /**
     * Người nhận thông báo
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_receiver_id", nullable = false)
    private Users userReceiver;

    /**
     * Tiêu đề thông báo
     */
    @Column(name = "title", length = 255)
    private String title;

    /**
     * Nội dung thông báo
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * ID của entity liên quan (message ID, friend request ID, etc)
     */
    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    /**
     * Trạng thái đã đọc hay chưa
     */
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    /**
     * Thời gian đã đọc
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;

    /**
     * Thời gian tạo thông báo
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

