package com.dntn.datn_be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class Users  extends  BaseEntity
{
    @Column(name = "username")
    private String username;

    @JsonIgnore
    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "age")
    private String age;

    @Column(name = "address",length = 1000)
    private String address;

    @Column(name = "exp")
    private String exp;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "images_url",length = 1000)
    private String imagesUrl;

    @Column(name = "is_coach")
    private boolean isCoach;

    @Column(name = "vote_star")
    private Integer voteStar;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Roles> roles = new HashSet<>();


}
