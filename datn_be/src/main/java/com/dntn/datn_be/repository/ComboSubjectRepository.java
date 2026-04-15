package com.dntn.datn_be.repository;

import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.model.ComboSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboSubjectRepository extends JpaRepository<ComboSubject,Long> {
    
    /**
     * Delete all ComboSubject records by combo ID
     * @param comboId Combo ID
     */
    void deleteByComboId(Long comboId);

    /**
     * Get all distinct subjects that have combos
     * @return List of subject IDs that are associated with combos
     */
    @Query("SELECT DISTINCT cs.subjectId FROM ComboSubject cs ORDER BY cs.subjectId")
    List<Long> findAllDistinctSubjectIds();
}
