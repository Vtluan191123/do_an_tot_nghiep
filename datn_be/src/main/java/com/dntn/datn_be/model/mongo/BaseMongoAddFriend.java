package com.dntn.datn_be.model.mongo;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "add_friend")
@Getter
@Setter
public class BaseMongoAddFriend extends BaseAbstractAuditingDocument {
    @Field("user_id_add")
    private Integer userAdd;
    @Field("user_id_receiver")
    private Integer userReceiver;
    @Field("status")
    private Integer status; //0:khởi tạo ,1 chấp nhận,2 hủy chấp nhận
}
