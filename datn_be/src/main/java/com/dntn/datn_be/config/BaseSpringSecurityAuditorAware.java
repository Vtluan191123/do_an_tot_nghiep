package com.dntn.datn_be.config;

import com.dntn.datn_be.dto.common.UserDetailCustom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class BaseSpringSecurityAuditorAware implements AuditorAware<Integer> {
    Logger logger = LoggerFactory.getLogger(BaseSpringSecurityAuditorAware.class);
    @Override
    public Optional<Integer> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        logger.info("Current User: {}", authentication.getPrincipal());
        UserDetailCustom user = null;
        if(authentication.getPrincipal() instanceof UserDetailCustom){
            user = (UserDetailCustom) authentication.getPrincipal();
        }

        return Optional.of(user!=null ? Integer.parseInt(user.getId().toString()): 0);
    }
}
