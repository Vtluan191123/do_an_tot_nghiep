package com.dntn.datn_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubjectUpdateRequest {
    
    private Long id;
    
    private String name;
    
    private String description;
    
    private String images;
    
    private String status;
    
    private int size;
}
