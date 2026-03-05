package com.dntn.datn_be.model.mongo;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "message")
@Builder
public class BaseMongoMessage extends BaseAbstractAuditingDocument{

    @Field("groud_id")
    private String groudId;
    @Field("sender_id")
    private Integer senderId;
    @Field("message_detail")
    private Object messageDetail;

}
