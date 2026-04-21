package com.dntn.datn_be.repository.impl;

import com.dntn.datn_be.dto.request.TimeSlotsSubjectFilterRequest;
import com.dntn.datn_be.model.TimeSlotsSubject;
import com.dntn.datn_be.repository.TimeSlotsSubjectRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TimeSlotsSubjectRepositoryImpl implements TimeSlotsSubjectRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<TimeSlotsSubject> filter(TimeSlotsSubjectFilterRequest request) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        
        // Build main query
        CriteriaQuery<TimeSlotsSubject> query = cb.createQuery(TimeSlotsSubject.class);
        Root<TimeSlotsSubject> root = query.from(TimeSlotsSubject.class);
        
        List<Predicate> predicates = buildPredicates(cb, root, request);
        query.where(predicates.toArray(new Predicate[0]));

        // ===== sorting =====
        String sortBy = getSortField(request.getSortBy());
        Order order = "asc".equalsIgnoreCase(request.getSortDirection()) 
            ? cb.asc(root.get(sortBy)) 
            : cb.desc(root.get(sortBy));
        query.orderBy(order);

        // ===== get results =====
        TypedQuery<TimeSlotsSubject> typedQuery = entityManager.createQuery(query);
        
        // ===== pagination =====
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        int offset = page * size;

        typedQuery.setFirstResult(offset);
        typedQuery.setMaxResults(size);

        List<TimeSlotsSubject> resultList = typedQuery.getResultList();

        // Build count query separately with new root
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<TimeSlotsSubject> countRoot = countQuery.from(TimeSlotsSubject.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, request);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(resultList, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<TimeSlotsSubject> root, TimeSlotsSubjectFilterRequest request) {
        List<Predicate> predicates = new ArrayList<>();

        // ===== filter by coachId (optional) =====
        // If coachId is provided, filter by that coach
        // If not provided, show all time slots (public view)
        if (request.getCoachId() != null) {
            predicates.add(cb.equal(root.get("coachId"), request.getCoachId()));
        }

        // ===== filter by subjectId =====
        if (request.getSubjectId() != null) {
            predicates.add(cb.equal(root.get("subjectId"), request.getSubjectId()));
        }

        // ===== filter by subjectName =====
        if (request.getSubjectName() != null && !request.getSubjectName().isEmpty()) {
            predicates.add(cb.like(
                cb.lower(root.get("subjectName")),
                "%" + request.getSubjectName() + "%"
            ));
        }

        // ===== filter by trainingMethods =====
        if (request.getTrainingMethods() != null && !request.getTrainingMethods().isEmpty()) {
            predicates.add(cb.equal(root.get("trainingMethods"), request.getTrainingMethods()));
        }

        // ===== filter by status (based on capacity) =====
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            if (request.getStatus().equals("available")) {
                predicates.add(cb.lt(root.get("currentCapacity"), root.get("maxCapacity")));
            } else if (request.getStatus().equals("full")) {
                predicates.add(cb.ge(root.get("currentCapacity"), root.get("maxCapacity")));
            }
        }

        return predicates;
    }

    private String getSortField(String sortBy) {
        List<String> allowedFields = List.of("id", "createdAt", "updatedAt", "trainingMethods", "maxCapacity", "currentCapacity");
        return allowedFields.contains(sortBy) ? sortBy : "createdAt";
    }
}

