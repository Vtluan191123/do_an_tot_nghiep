package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Notification;
import com.dntn.datn_be.model.NotificationType;
import com.dntn.datn_be.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Lấy tất cả thông báo của người dùng (người nhận)
     */
    List<Notification> findByUserReceiver(Users userReceiver);

    /**
     * Lấy thông báo chưa đọc của người dùng
     */
    List<Notification> findByUserReceiverAndIsReadFalse(Users userReceiver);

    /**
     * Đếm số thông báo chưa đọc
     */
    long countByUserReceiverAndIsReadFalse(Users userReceiver);

    /**
     * Lấy thông báo theo loại
     */
    List<Notification> findByUserReceiverAndType(Users userReceiver, NotificationType type);

    /**
     * Lấy thông báo của người dùng có phân trang
     */
    Page<Notification> findByUserReceiverOrderByCreatedAtDesc(Users userReceiver, Pageable pageable);

    /**
     * Lấy thông báo chưa đọc có phân trang
     */
    Page<Notification> findByUserReceiverAndIsReadFalseOrderByCreatedAtDesc(Users userReceiver, Pageable pageable);

    /**
     * Lấy thông báo theo người gửi và người nhận
     */
    List<Notification> findByUserSendAndUserReceiver(Users userSend, Users userReceiver);

    /**
     * Kiểm tra có thông báo kết bạn từ người gửi chưa
     */
    @Query("SELECT n FROM Notification n WHERE n.userSend = :userSend AND n.userReceiver = :userReceiver " +
            "AND n.type = :type ORDER BY n.createdAt DESC LIMIT 1")
    Notification findLatestFriendRequest(@Param("userSend") Users userSend, 
                                         @Param("userReceiver") Users userReceiver,
                                         @Param("type") NotificationType type);

    /**
     * Lấy thông báo theo relatedEntityId (message ID, friend request ID, etc)
     */
    Notification findByRelatedEntityId(Long relatedEntityId);
}

