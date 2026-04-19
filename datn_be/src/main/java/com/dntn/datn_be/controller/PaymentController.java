package com.dntn.datn_be.controller;

import com.dntn.datn_be.config.VNPayConfig;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.model.Users;
import com.dntn.datn_be.service.AuthService;
import com.dntn.datn_be.service.VNPayService;
import com.dntn.datn_be.service.OrderService;
import com.dntn.datn_be.model.Order;
import com.dntn.datn_be.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final AuthService authService;
    private final OrderService orderService;

    /**
     * Create VNPay payment URL
     * @param subjectId Subject ID to enroll
     * @param sessions Number of sessions to enroll
     * @param request HTTP request
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
            HttpServletRequest request) {


        Users currentUser = authService.getCurrentUser();

        // ✅ 1. CREATE ORDER (PENDING)
        Order order = Order.builder()
                .userId(currentUser.getId())
                .subjectId(subjectId)
                .quantity(sessions)
                .orderType("SUBJECT")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(amount))
                .fullName(fullName)
                .email(email)
                .phoneNumber(phone)
                .build();

        order = orderRepository.save(order);

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
        String orderInfo = "Order-" + order.getId() + "-subject-" + subjectId;

        String paymentUrl = vnPayService.createOrder(amount, orderInfo, baseUrl);

        return ResponseGlobalDto.<String>builder()
                .status(HttpStatus.OK.value())
                .data(paymentUrl)
                .message("Payment URL created successfully")
                .build();
    }

    /**
     * VNPay return callback endpoint
     * @param request HTTP request with VNPay response
     * @param httpServletResponse HTTP response
     * @return Payment result
     */
    @GetMapping("/vnpay-payment")
    public void paymentCallback(
            HttpServletRequest request,
            HttpServletResponse httpServletResponse) throws IOException {
        System.out.println(request.getQueryString());

        int paymentStatus = vnPayService.orderReturn(request);

        // Get orderId from orderInfo parameter (format: Order-{orderId}-subject-{subjectId})
        String orderInfo = request.getParameter("vnp_OrderInfo");
        Long orderId = extractOrderIdFromOrderInfo(orderInfo);
        
        String redirectUrl;

        if (paymentStatus == 1 && orderId != null) {
            // Payment successful - update Order status and create UserSubject
            try {
                Order order = orderRepository.findById(orderId).orElse(null);
                if (order != null) {
                    order.setPaymentStatus("SUCCESS");
                    order.setTransactionId(request.getParameter("vnp_TransactionNo"));
                    orderRepository.save(order);

                    // ✅ Process order to create UserSubject record
                    Map<String, Object> paymentData = new HashMap<>();
                    paymentData.put("orderType", order.getOrderType());
                    orderService.processOrderAfterPayment(orderId, paymentData);
                }
            } catch (Exception e) {
                System.err.println("Error updating order: " + e.getMessage());
                e.printStackTrace();
            }
            redirectUrl = "http://localhost:4200/payment/success";
        } else {
            redirectUrl = "http://localhost:4200/payment/fail";
        }

        httpServletResponse.sendRedirect(redirectUrl);
    }

    /**
     * Extract orderId from orderInfo (format: Order-{orderId}-...)
     */
    private Long extractOrderIdFromOrderInfo(String orderInfo) {
        try {
            if (orderInfo != null && orderInfo.startsWith("Order-")) {
                String[] parts = orderInfo.split("-");
                if (parts.length > 1) {
                    return Long.parseLong(parts[1]);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting orderId: " + e.getMessage());
        }
        return null;
    }

    /**
     * Create VNPay payment URL for Combo
     * @param comboId Combo ID to purchase
     * @param quantity Number of months to purchase
     * @param request HTTP request
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
            HttpServletRequest request) {

        Users currentUser = authService.getCurrentUser();

        // ✅ 1. CREATE ORDER (PENDING)
        Order order = Order.builder()
                .userId(currentUser.getId())
                .comboId(comboId)
                .quantity(quantity)
                .orderType("COMBO")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(amount))
                .fullName(fullName)
                .email(email)
                .phoneNumber(phone)
                .build();

        order = orderRepository.save(order);

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
        String orderInfo = "Order-" + order.getId() + "-combo-" + comboId;

        String paymentUrl = vnPayService.createOrder(amount, orderInfo, baseUrl);

        return ResponseGlobalDto.<String>builder()
                .status(HttpStatus.OK.value())
                .data(paymentUrl)
                .message("Payment URL created successfully")
                .build();
    }
}
