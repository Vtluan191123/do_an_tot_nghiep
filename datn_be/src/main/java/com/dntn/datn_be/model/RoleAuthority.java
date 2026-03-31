package com.dntn.datn_be.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "role_authority")
public class RoleAuthority extends BaseEntity {

    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "authority_id")
    private Long authorityId;

    @Column(name = "role_code")
    private String roleCode;

    @Column(name = "authority_code")
    private String authorityCode;
}
