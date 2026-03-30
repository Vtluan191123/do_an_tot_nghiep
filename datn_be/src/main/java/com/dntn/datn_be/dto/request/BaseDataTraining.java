package com.dntn.datn_be.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class BaseDataTraining {
    private Map<String,Object> data;
}
