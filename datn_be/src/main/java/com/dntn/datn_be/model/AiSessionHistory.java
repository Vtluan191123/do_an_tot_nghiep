package com.dntn.datn_be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Entity
@Table(name = "ai_session_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSessionHistory extends BaseEntity {

    @Column(name = "session_id", unique = true, nullable = false, length = 36)
    private String sessionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "metadata")
    private String metadata; // JSON string containing list of questions and answers

    @Column(name = "status")
    private String status; // ACTIVE, COMPLETED, ARCHIVED

    @Column(name = "description", length = 1000)
    private String description;

    @PrePersist
    protected void onCreate() {
        if (this.sessionId == null) {
            this.sessionId = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }
}

