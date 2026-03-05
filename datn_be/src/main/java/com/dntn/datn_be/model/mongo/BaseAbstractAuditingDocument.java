package com.dntn.datn_be.model.mongo;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
public class BaseAbstractAuditingDocument implements Serializable {


    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @CreatedBy
    @Field("creator")
    private Integer creator;

    @CreatedDate
    @Field("create_time")
    private Instant createTime;

    @LastModifiedBy
    @Field("updater")
    private Integer updater;

    @LastModifiedDate
    @Field("update_time")
    private Instant updateTime;


    public LocalDateTime getCreateTimeVN() {
        return createTime == null ? null :
                LocalDateTime.ofInstant(createTime, ZoneId.of("Asia/Ho_Chi_Minh"));
    }

    public LocalDateTime getUpdateTimeVN() {
        return updateTime == null ? null :
                LocalDateTime.ofInstant(updateTime, ZoneId.of("Asia/Ho_Chi_Minh"));
    }

}
