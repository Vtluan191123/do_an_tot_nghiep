package com.dntn.datn_be.service.impl;

import com.dntn.datn_be.model.Combo;
import com.dntn.datn_be.model.ComboSubject;
import com.dntn.datn_be.model.Order;
import com.dntn.datn_be.model.UserSubject;
import com.dntn.datn_be.repository.ComboRepository;
import com.dntn.datn_be.repository.ComboSubjectRepository;
import com.dntn.datn_be.repository.OrderRepository;
import com.dntn.datn_be.repository.UserSubjectRepository;
import com.dntn.datn_be.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserSubjectRepository userSubjectRepository;
    private final ComboRepository comboRepository;
    private final ComboSubjectRepository comboSubjectRepository;

    @Override
    @Transactional
    public Order processOrderAfterPayment(Long orderId, Map<String, Object> paymentData) {
        try {
            // Fetch existing order that was already saved by PaymentController
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            String orderType = order.getOrderType();

            if ("SUBJECT".equals(orderType)) {
                // Handle SUBJECT order - create or update UserSubject record
                Long userId = order.getUserId();
                Long subjectId = order.getSubjectId();
                Integer sessions = order.getQuantity();

                if (userId != null && subjectId != null && sessions > 0) {
                    // Check if UserSubject already exists
                    UserSubject existingUserSubject = userSubjectRepository.findBySubjectIdAndUserId(subjectId, userId);
                    
                    if (existingUserSubject != null) {
                        // Update existing total
                        existingUserSubject.setTotal(existingUserSubject.getTotal() + sessions);
                        userSubjectRepository.save(existingUserSubject);
                    } else {
                        // Create new UserSubject
                        UserSubject userSubject = UserSubject.builder()
                                .userId(userId)
                                .subjectId(subjectId)
                                .total((long) sessions)
                                .isCoach(false)
                                .build();
                        userSubjectRepository.save(userSubject);
                    }
                }

            } else if ("COMBO".equals(orderType)) {
                // Handle COMBO order - create or update UserSubject records for each subject in combo
                Long userId = order.getUserId();
                Long comboId = order.getComboId();
                Integer quantity = order.getQuantity();

                if (userId != null && comboId != null && quantity > 0) {
                    List<ComboSubject> comboSubjects = comboSubjectRepository.findByComboId(comboId);
                    for (ComboSubject comboSubject : comboSubjects) {
                        // Calculate total sessions for this subject
                        // quantity is number of months, totalTeach is sessions per month
                        Long totalSessions = (long) (comboSubject.getTotalTeach() * quantity);

                        // Check if UserSubject already exists
                        UserSubject existingUserSubject = userSubjectRepository.findBySubjectIdAndUserId(comboSubject.getSubjectId(), userId);
                        
                        if (existingUserSubject != null) {
                            // Update existing total
                            existingUserSubject.setTotal(existingUserSubject.getTotal() + totalSessions);
                            userSubjectRepository.save(existingUserSubject);
                        } else {
                            // Create new UserSubject
                            UserSubject userSubject = UserSubject.builder()
                                    .userId(userId)
                                    .subjectId(comboSubject.getSubjectId())
                                    .total(totalSessions)
                                    .isCoach(false)
                                    .build();
                            userSubjectRepository.save(userSubject);
                        }
                    }
                }
            }

            return order;
        } catch (Exception e) {
            System.err.println("Error in processOrderAfterPayment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process order", e);
        }
    }
}

