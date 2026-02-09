package com.dntn.datn_be.service.custom;

import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserDetailServiceCustom implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Users> userOpt = this.userRepository.findUsersByUsername(username);
        if(userOpt.isEmpty()){
            throw new UsernameNotFoundException("Username not found");
        }
        Users user = userOpt.get();

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                true,
                true,               // accountNonExpired
                true,               // credentialsNonExpired
                true,               // accountNonLocked
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(Users user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getCode()))
                .toList();
    }
}
