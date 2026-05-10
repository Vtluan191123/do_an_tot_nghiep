package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.AiSessionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiSessionHistoryRepository extends JpaRepository<AiSessionHistory, Long> {

    /**
     * Find session by session_id
     */
    Optional<AiSessionHistory> findBySessionId(String sessionId);

    /**
     * Find all sessions by user_id
     */
    List<AiSessionHistory> findByUserId(Long userId);

    /**
     * Find all active sessions by user_id
     */
    @Query("SELECT a FROM AiSessionHistory a WHERE a.userId = :userId AND a.status = 'ACTIVE'")
    List<AiSessionHistory> findActiveSessionsByUserId(@Param("userId") Long userId);

    /**
     * Find all sessions by user_id and status
     */
    List<AiSessionHistory> findByUserIdAndStatus(Long userId, String status);

    /**
     * Delete all sessions by user_id
     */
    void deleteByUserId(Long userId);
}

