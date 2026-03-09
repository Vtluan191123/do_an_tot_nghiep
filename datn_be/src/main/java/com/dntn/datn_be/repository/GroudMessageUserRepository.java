package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.GroudMessageUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroudMessageUserRepository extends JpaRepository<GroudMessageUser,String>, GroudMessageUserRepositoryCustom {
    List<GroudMessageUser> findByGroudId(String groudId);
}
