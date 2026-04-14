package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.SubjectFilterRequest;
import com.dntn.datn_be.model.Subject;
import com.dntn.datn_be.repository.SubjectRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubjectRepositoryImpl implements SubjectRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Subject> filter(SubjectFilterRequest request, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        
        // ===== Build count query =====
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Subject> countRoot = countQuery.from(Subject.class);
        countQuery.select(cb.count(countRoot));
        
        List<Predicate> predicates = buildPredicates(cb, countRoot, request);
        if (!predicates.isEmpty()) {
            countQuery.where(cb.and(predicates.toArray(new Predicate[0])));
        }
        
        Long total = entityManager.createQuery(countQuery).getSingleResult();
        
        // ===== Build data query =====
        CriteriaQuery<Subject> dataQuery = cb.createQuery(Subject.class);
        Root<Subject> dataRoot = dataQuery.from(Subject.class);
        dataQuery.select(dataRoot);
        
        predicates = buildPredicates(cb, dataRoot, request);
        if (!predicates.isEmpty()) {
            dataQuery.where(cb.and(predicates.toArray(new Predicate[0])));
        }
        
        // Apply sorting from Pageable
        dataQuery.orderBy(pageable.getSort().stream()
                .map(order -> order.isAscending() 
                    ? cb.asc(dataRoot.get(order.getProperty()))
                    : cb.desc(dataRoot.get(order.getProperty())))
                .toList());
        
        List<Subject> content = entityManager.createQuery(dataQuery)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();
        
        return new PageImpl<>(content, pageable, total);
    }
    
    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Subject> root, SubjectFilterRequest request) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Filter by id
        if (request.getId() != null) {
            predicates.add(cb.equal(root.get("id"), request.getId()));
        }
        
        // Filter by status
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            predicates.add(cb.equal(root.get("status"), request.getStatus()));
        }
        
        // Filter by keyword
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            String keyword = "%" + request.getKeyword() + "%";
            predicates.add(cb.or(
                cb.like(root.get("name"), keyword),
                cb.like(root.get("description"), keyword)
            ));
        }
        
        return predicates;
    }
}

