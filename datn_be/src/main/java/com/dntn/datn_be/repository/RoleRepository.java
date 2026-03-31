package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Roles,Long> {
    @Query("SELECT r.code FROM Roles r WHERE r.id = :roleId")
    String getCodeById(@Param("roleId") Long roleId);

    @Query(value = """
    select a.code from roles r
    join role_authority ra on r.id = ra.role_id
    join authorities a on ra.authority_id = a.id
    where r.id = :roleId
""", nativeQuery = true)
    List<String> getCodeAuthoritiesById(@Param("roleId") Long roleId);
}
