package com.dntn.datn_be.controller;

import com.dntn.datn_be.config.VNPayConfig;
import com.dntn.datn_be.dto.common.ResponseGlobalDto;
import com.dntn.datn_be.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;

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
        sessionData.put("phone", phone);

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
    public ResponseGlobalDto<Map<String, Object>> paymentCallback(
            HttpServletRequest request,
            HttpSession session) {

        int paymentStatus = vnPayService.orderReturn(request);

        Map<String, Object> response = new HashMap<>();
        response.put("paymentStatus", paymentStatus);
        response.put("orderInfo", request.getParameter("vnp_OrderInfo"));
        response.put("paymentTime", request.getParameter("vnp_PayDate"));
        response.put("transactionId", request.getParameter("vnp_TransactionNo"));
        response.put("totalPrice", request.getParameter("vnp_Amount"));
        response.put("transactionStatus", request.getParameter("vnp_TransactionStatus"));

        // Get session data
        @SuppressWarnings("unchecked")
        Map<String, Object> paymentData = (Map<String, Object>) session.getAttribute("paymentData");
        if (paymentData != null) {
            response.put("sessionData", paymentData);
        }

        String statusMessage = paymentStatus == 1 ? "Payment successful" : (paymentStatus == 0 ? "Payment failed" : "Invalid payment");

        return ResponseGlobalDto.<Map<String, Object>>builder()
                .status(paymentStatus == 1 ? HttpStatus.OK.value() : HttpStatus.BAD_REQUEST.value())
                .data(response)
                .message(statusMessage)
                .build();
    }
}

