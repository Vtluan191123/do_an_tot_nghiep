package com.dntn.datn_be.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserFilterRequest extends BaseFilterRequest {

    private Long id;
    private Long roleId;

    // filter theo khoảng thời gian
    private String fromDate;
    private String toDate;

    // Tìm kiếm theo keyword (kế thừa từ BaseFilterRequest)
    // Backend sẽ tìm kiếm trong username, email, v.v
    // Sử dụng: keyword = "search_term" từ frontend
}


