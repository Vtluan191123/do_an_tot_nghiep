package com.dntn.datn_be.model;

/**
 * Enum định nghĩa các loại thông báo
 */
public enum NotificationType {
    /**
     * Tin nhắn mới
     */
    MESSAGE("Tin nhắn mới"),

    /**
     * Lời mời kết bạn
     */
    FRIEND_REQUEST("Lời mời kết bạn"),

    /**
     * Chấp nhận lời mời kết bạn
     */
    FRIEND_ACCEPTED("Đã chấp nhận lời mời kết bạn"),

    /**
     * Thông báo khác
     */
    OTHER("Thông báo khác");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

