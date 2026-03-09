package com.dntn.datn_be.model;

import jakarta.persistence.Column;
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

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "groud_id")
    private String groudId;

    @Column(name = "is_read")
    private boolean isRead;
}
