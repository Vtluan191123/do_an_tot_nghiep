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
}
