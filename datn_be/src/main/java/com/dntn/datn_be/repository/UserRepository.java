package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface  UserRepository extends JpaRepository<Users,Long>, UserRepositoryCustom {
    Optional<Users> findUsersByUsername(String username);
}
