package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long>, ComboRepositoryCustom {
}
