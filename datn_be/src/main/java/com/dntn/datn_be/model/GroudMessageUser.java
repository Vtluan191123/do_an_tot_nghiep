package com.dntn.datn_be.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "groud_message_user")
@Builder
public class GroudMessageUser extends BaseEntity {

    @Field("user_id")
    private Integer userId;

    @Field("groud_id")
    private String groudId;
}
