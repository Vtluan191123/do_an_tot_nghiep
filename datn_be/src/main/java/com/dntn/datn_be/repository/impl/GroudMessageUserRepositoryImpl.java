package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.response.GetListGroudsDto;
import com.dntn.datn_be.repository.GroudMessageUserRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class GroudMessageUserRepositoryImpl implements GroudMessageUserRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Integer messageUnReadTotal(Long id) {
        String queryString = """
            SELECT count(*) as messUnRead
            FROM users u
            JOIN groud_message_user gmu
                ON u.id = gmu.user_id
            WHERE gmu.groud_id IN (
                SELECT groud_id
                FROM groud_message_user
                WHERE user_id = :userId
            )
            AND u.id <> :userId and gmu.is_read = 0; 
        """;

        Query query = entityManager.createNativeQuery(queryString);
        query.setParameter("userId", id);

        int results = query.getFirstResult();

        return results;
    }
}
