package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ComboUpdateRequest {
    
    private Long id;
    
    private String code;
    
    private String name;
    
    private String description;
    
    private BigDecimal prices;
    
    private List<ComboSubjectRequest> comboSubjectRequests;
}
