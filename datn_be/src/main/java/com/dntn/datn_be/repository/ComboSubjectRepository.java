package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.ComboSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboSubjectRepository extends JpaRepository<ComboSubject,Long> {
}
