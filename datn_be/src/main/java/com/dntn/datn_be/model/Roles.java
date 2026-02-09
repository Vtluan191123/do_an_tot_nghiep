package com.dntn.datn_be.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "roles")
public class Roles extends BaseEntity{
    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;


    @ManyToMany(mappedBy = "roles")
    private List<Users> users = new ArrayList<>();

    @ManyToMany(fetch =  FetchType.LAZY,
            cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    @JoinTable(
            name = "role_authority",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "authority_id")
    )
    private Set<Authorities> authorities = new HashSet<>();

}
