package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Authorities;
import com.dntn.datn_be.model.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthoritiesRepository extends JpaRepository<Authorities,Long> {

}
