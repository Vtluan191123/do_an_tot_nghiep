package com.dntn.datn_be.service;

import com.dntn.datn_be.model.Order;
import java.util.Map;

public interface OrderService {
    /**
     * Process order after successful payment and create corresponding UserSubject records
     * @param orderId Order ID that was already saved
     * @param paymentData Payment data containing order information
     * @return Updated Order
     */
    Order processOrderAfterPayment(Long orderId, Map<String, Object> paymentData);
}

