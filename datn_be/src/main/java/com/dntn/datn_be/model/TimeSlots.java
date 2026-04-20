package com.dntn.datn_be.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "time_slots")
public class TimeSlots extends BaseEntity{
    @Column(name = "date")
    private LocalDate date;   // lưu ngày
    @Column(name = "start_time")
    private LocalDateTime startTime;
    @Column(name = "end_time")
    private LocalDateTime endTime;

    //từ 5H đến 12H ,mỗi khung giờ là 1 tiếng
}
