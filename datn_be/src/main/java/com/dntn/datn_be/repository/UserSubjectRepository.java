package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.UserSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSubjectRepository extends JpaRepository<UserSubject,Long> {
    List<UserSubject> findByUserIdAndIsCoachTrue(Long userId);
    void deleteByUserId(Long userId);
}
