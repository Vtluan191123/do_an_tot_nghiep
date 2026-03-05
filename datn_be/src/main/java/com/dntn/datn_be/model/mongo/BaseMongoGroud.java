package com.dntn.datn_be.model.mongo;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Builder
@Document(collection = "groud")
public class BaseMongoGroud extends BaseAbstractAuditingDocument{
    @Field("type")
    private Integer type; //type 0: friend | 1:zoom

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("quantity")
    private Integer quantity;
}
