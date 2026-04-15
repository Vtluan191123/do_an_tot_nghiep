package com.dntn.datn_be.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserFilterRequest extends BaseFilterRequest {

    private Long id;
    private Long roleId;
    private Boolean isActive;
    private boolean isAdmin;

    // Tìm kiếm theo keyword (kế thừa từ BaseFilterRequest)
    // Backend sẽ tìm kiếm trong username, email, fullName, v.v với LIKE và OR
}


