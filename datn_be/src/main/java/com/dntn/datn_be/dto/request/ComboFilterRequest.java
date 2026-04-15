package com.dntn.datn_be.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ComboFilterRequest extends BaseFilterRequest {
    
    private Long id;
    
    private String code;
    
    private Long subjectId;
    
    private String subjectName;
}
