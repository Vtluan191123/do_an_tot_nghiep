package com.dntn.datn_be.dto.response;

import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.model.Users;
import lombok.Getter;
import lombok.Setter;

/**
 * UserResponse DTO
 * statusFriend:
 *   - null/không có = Không phải bạn bè (có thể kết bạn)
 *   - 0 = Lời mời kết bạn đang chờ (pending)
 *   - 1 = Đã kết bạn (accepted)
 * sentByMe:
 *   - true = Tôi gửi lời mời
 *   - false = Người khác gửi lời mời cho tôi
 */
@Getter
@Setter
public class UserResponse extends Users {
    /**
     * Trạng thái kết bạn
     * null = không phải bạn bè
     * 0 = chờ chấp nhận
     * 1 = đã kết bạn
     */
    Integer statusFriend;
    
    /**
     * Nếu statusFriend = 0 (pending):
     * true = Tôi gửi lời mời cho người này
     * false = Người này gửi lời mời cho tôi
     */
    Boolean sentByMe;
}


