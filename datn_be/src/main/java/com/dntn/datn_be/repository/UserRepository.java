package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface  UserRepository extends JpaRepository<Users,Long> {
    Optional<Users> findUsersByUsername(String username);
}
