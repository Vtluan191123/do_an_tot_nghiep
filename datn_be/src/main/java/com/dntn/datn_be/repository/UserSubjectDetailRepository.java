package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.UserSubjectDetail;
import jakarta.persistence.OneToMany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSubjectDetailRepository extends JpaRepository<UserSubjectDetail,Long> {
}
