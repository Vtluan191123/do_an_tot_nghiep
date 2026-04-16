package com.dntn.datn_be.controller;

import com.dntn.datn_be.config.VNPayConfig;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.VNPayService;
import com.dntn.datn_be.model.Order;
import com.dntn.datn_be.model.UserSubject;
import com.dntn.datn_be.repository.OrderRepository;
import com.dntn.datn_be.repository.UserSubjectRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderRepository orderRepository;
    private final UserSubjectRepository userSubjectRepository;

    /**
     * Create VNPay payment URL
     * @param subjectId Subject ID to enroll
     * @param sessions Number of sessions to enroll
     * @param request HTTP request
     * @param session HTTP session
     * @return VNPay payment URL
     */
    @PostMapping("/vnpay-submit-order")
    public ResponseGlobalDto<String> submitOrder(
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("sessions") int sessions,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("amount") long amount,
            HttpServletRequest request,
            HttpSession session) {

        // Validate VNPay configuration
        if (VNPayConfig.vnp_TmnCode == null || VNPayConfig.vnp_TmnCode.isEmpty()) {
            return ResponseGlobalDto.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("VNPay TMN Code chưa được cấu hình")
                    .build();
        }

        if (VNPayConfig.vnp_HashSecret == null || VNPayConfig.vnp_HashSecret.isEmpty()) {
            return ResponseGlobalDto.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("VNPay Hash Secret chưa được cấu hình")
                    .build();
        }

        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String orderInfo = "Enroll subject " + subjectId + " for " + sessions + " sessions - " + fullName;

        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("subjectId", subjectId);
        sessionData.put("sessions", sessions);
        sessionData.put("fullName", fullName);
        sessionData.put("email", email);
        sessionData.put("phone_number", phone);
        sessionData.put("orderType", "SUBJECT");

        String paymentUrl = vnPayService.createOrder(amount, orderInfo, baseUrl, sessionData);

        // Store in session
        session.setAttribute("paymentData", sessionData);

        return ResponseGlobalDto.<String>builder()
                .status(HttpStatus.OK.value())
                .data(paymentUrl)
                .message("Payment URL created successfully")
                .build();
    }

    /**
     * VNPay return callback endpoint
     * @param request HTTP request with VNPay response
     * @param session HTTP session
     * @return Payment result
     */
    @GetMapping("/vnpay-payment")
    public void paymentCallback(
            HttpServletRequest request,
            HttpSession session,
            HttpServletResponse httpServletResponse) throws IOException {

        int paymentStatus = vnPayService.orderReturn(request);

        // Get session data
        @SuppressWarnings("unchecked")
        Map<String, Object> paymentData = (Map<String, Object>) session.getAttribute("paymentData");
        
        String redirectUrl;

        if (paymentStatus == 1) {
            // Payment successful - tạo Order
            if (paymentData != null) {
                try {
                    createOrderFromPayment(paymentData, request);
                } catch (Exception e) {
                    System.err.println("Error creating order: " + e.getMessage());
                }
            }
            redirectUrl = "http://localhost:4200/payment/success";
        } else {
            redirectUrl = "http://localhost:4200/payment/fail";
        }

        httpServletResponse.sendRedirect(redirectUrl);
    }

    /**
     * Tạo Order record sau thanh toán thành công
     */
    private void createOrderFromPayment(Map<String, Object> paymentData, HttpServletRequest request) {
        try {
            String orderType = (String) paymentData.getOrDefault("orderType", "SUBJECT");
            
            Order order = Order.builder()
                    .transactionId(request.getParameter("vnp_TransactionNo"))
                    .totalAmount(new BigDecimal(request.getParameter("vnp_Amount") != null ? 
                            Long.parseLong(request.getParameter("vnp_Amount")) / 100 : 0))
                    .paymentStatus("SUCCESS")
                    .orderType(orderType)
                    .fullName((String) paymentData.getOrDefault("fullName", ""))
                    .email((String) paymentData.getOrDefault("email", ""))
                    .phoneNumber((String) paymentData.getOrDefault("phone_number", ""))
                    .notes("VNPay payment")
                    .build();

            if ("SUBJECT".equals(orderType)) {
                Long subjectId = paymentData.get("subjectId") != null ? 
                        Long.parseLong(String.valueOf(paymentData.get("subjectId"))) : null;
                Integer sessions = paymentData.get("sessions") != null ? 
                        (Integer) paymentData.get("sessions") : 0;
                
                order.setSubjectId(subjectId);
                order.setQuantity(sessions);
            } else if ("COMBO".equals(orderType)) {
                Long comboId = paymentData.get("comboId") != null ? 
                        Long.parseLong(String.valueOf(paymentData.get("comboId"))) : null;
                Integer quantity = paymentData.get("quantity") != null ? 
                        (Integer) paymentData.get("quantity") : 0;
                
                order.setComboId(comboId);
                order.setQuantity(quantity);
            }

            orderRepository.save(order);
        } catch (Exception e) {
            System.err.println("Error in createOrderFromPayment: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create VNPay payment URL for Combo
     * @param comboId Combo ID to purchase
     * @param quantity Number of months to purchase
     * @param request HTTP request
     * @param session HTTP session
     * @return VNPay payment URL
     */
    @PostMapping("/vnpay-submit-order-combo")
    public ResponseGlobalDto<String> submitComboOrder(
            @RequestParam("comboId") Long comboId,
            @RequestParam("quantity") int quantity,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("amount") long amount,
            HttpServletRequest request,
            HttpSession session) {

        // Validate VNPay configuration
        if (VNPayConfig.vnp_TmnCode == null || VNPayConfig.vnp_TmnCode.isEmpty()) {
            return ResponseGlobalDto.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("VNPay TMN Code chưa được cấu hình")
                    .build();
        }

        if (VNPayConfig.vnp_HashSecret == null || VNPayConfig.vnp_HashSecret.isEmpty()) {
            return ResponseGlobalDto.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("VNPay Hash Secret chưa được cấu hình")
                    .build();
        }

        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String orderInfo = "Purchase combo " + comboId + " for " + quantity + " months - " + fullName;

        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("comboId", comboId);
        sessionData.put("quantity", quantity);
        sessionData.put("fullName", fullName);
        sessionData.put("email", email);
        sessionData.put("phone_number", phone);
        sessionData.put("orderType", "COMBO");

        String paymentUrl = vnPayService.createOrder(amount, orderInfo, baseUrl, sessionData);

        // Store in session
        session.setAttribute("paymentData", sessionData);

        return ResponseGlobalDto.<String>builder()
                .status(HttpStatus.OK.value())
                .data(paymentUrl)
                .message("Payment URL created successfully")
                .build();
    }
}
