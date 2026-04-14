package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Bookings, Long>, BookingRepositoryCustom {
}

