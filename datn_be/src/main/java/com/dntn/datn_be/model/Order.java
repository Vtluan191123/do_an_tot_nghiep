package com.dntn.datn_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "orders")
public class Order extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "combo_id")
    private Long comboId;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "quantity")  // Số buổi hoặc số tháng
    private Integer quantity;

    @Column(name = "order_type")  // SUBJECT, COMBO
    private String orderType;

    @Column(name = "payment_status")  // PENDING, SUCCESS, FAILED
    private String paymentStatus;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "notes", length = 1000)
    private String notes;

}

