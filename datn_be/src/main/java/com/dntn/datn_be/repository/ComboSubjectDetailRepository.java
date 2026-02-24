package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.ComboSubjectDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboSubjectDetailRepository extends JpaRepository<ComboSubjectDetail,Long> {
}
