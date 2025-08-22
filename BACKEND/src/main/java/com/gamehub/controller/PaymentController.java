// Note: Controller xử lý API endpoints cho hệ thống thanh toán
// API endpoints: /api/v1/payment-info/*, /api/v1/deposits/*
package com.gamehub.controller;

import com.gamehub.dto.DepositApprovalRequest;
import com.gamehub.dto.DepositResponse;
import com.gamehub.dto.PaymentInfoRequest;
import com.gamehub.model.DepositRequest;
import com.gamehub.model.PaymentInfo;
import com.gamehub.model.User;
import com.gamehub.service.PaymentService;
import com.gamehub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    // ==================== ADMIN PAYMENT INFO MANAGEMENT ====================

    @PostMapping("/payment-info")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DESIGNER') or hasRole('DEVELOPER')")
    public ResponseEntity<PaymentInfo> createOrUpdatePaymentInfo(
            @Valid @RequestBody PaymentInfoRequest request,
            Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());
        PaymentInfo paymentInfo = paymentService.createOrUpdatePaymentInfo(user, request);
        return ResponseEntity.ok(paymentInfo);
    }

    // ==================== USER PAYMENT INFO MANAGEMENT ====================

    @GetMapping("/payment-info/my-info")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DESIGNER') or hasRole('DEVELOPER')")
    public ResponseEntity<PaymentInfo> getMyPaymentInfo(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Optional<PaymentInfo> paymentInfo = paymentService.getUserPaymentInfo(user);
        return paymentInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/payment-info")
    public ResponseEntity<PaymentInfo> getPaymentInfo() {
        Optional<PaymentInfo> paymentInfo = paymentService.getActivePaymentInfo();
        return paymentInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== DEVELOPER DEPOSIT REQUESTS ====================

    @PostMapping("/deposits")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<DepositResponse> createDepositRequest(
            @Valid @RequestBody com.gamehub.dto.DepositRequest request,
            Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());
        DepositRequest depositRequest = paymentService.createDepositRequest(user, request);
        DepositResponse response = paymentService.convertToDepositResponse(depositRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/deposits/my-requests")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<Page<DepositResponse>> getMyDepositRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DepositRequest> requests = paymentService.getUserDepositRequests(user, pageable);
        Page<DepositResponse> responseRequests = requests.map(paymentService::convertToDepositResponse);
        return ResponseEntity.ok(responseRequests);
    }

    // ==================== ADMIN DEPOSIT APPROVAL ====================

    @GetMapping("/deposits/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DepositResponse>> getPendingDepositRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<DepositRequest> requests = paymentService.getPendingDepositRequests(pageable);
        Page<DepositResponse> responseRequests = requests.map(paymentService::convertToDepositResponse);
        return ResponseEntity.ok(responseRequests);
    }

    @PutMapping("/deposits/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepositResponse> approveDepositRequest(
            @PathVariable Long id,
            @Valid @RequestBody DepositApprovalRequest request,
            Authentication authentication) {

        User admin = userService.findByEmail(authentication.getName());
        DepositRequest depositRequest = paymentService.approveDepositRequest(id, admin, request);
        DepositResponse response = paymentService.convertToDepositResponse(depositRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/deposits/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DEVELOPER') and @paymentService.getDepositRequestById(#id).user.email == authentication.name)")
    public ResponseEntity<DepositResponse> getDepositRequest(@PathVariable Long id) {
        DepositRequest depositRequest = paymentService.getDepositRequestById(id);
        DepositResponse response = paymentService.convertToDepositResponse(depositRequest);
        return ResponseEntity.ok(response);
    }
}
