// Note: Controller xử lý API endpoints cho giao dịch mua bán assets
// Đường dẫn: /api/v1/transactions - Developer mua assets, Admin duyệt giao dịch
package com.gamehub.controller;

import com.gamehub.dto.PurchaseAssetRequest;
import com.gamehub.dto.PurchasedAssetResponse;
import com.gamehub.dto.TransactionApprovalRequest;
import com.gamehub.dto.TransactionResponse;
import com.gamehub.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // Developer mua asset
    @PostMapping("/purchase")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<TransactionResponse> purchaseAsset(
            @Valid @RequestBody PurchaseAssetRequest request,
            Principal principal) {
        TransactionResponse response = transactionService.purchaseAsset(request, principal.getName());
        return ResponseEntity.ok(response);
    }

    // Admin xem danh sách giao dịch chờ duyệt
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TransactionResponse>> getPendingTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionResponse> transactions = transactionService.getPendingTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }

    // Admin duyệt giao dịch
    @PutMapping("/{transactionId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> approveTransaction(
            @PathVariable Long transactionId,
            Principal principal) {
        TransactionResponse response = transactionService.approveTransaction(transactionId, principal.getName());
        return ResponseEntity.ok(response);
    }

    // Admin từ chối giao dịch
    @PutMapping("/{transactionId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> rejectTransaction(
            @PathVariable Long transactionId,
            @RequestBody TransactionApprovalRequest request,
            Principal principal) {
        TransactionResponse response = transactionService.rejectTransaction(transactionId, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    // Developer xem lịch sử mua của mình
    @GetMapping("/my-purchases")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<Page<TransactionResponse>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionResponse> transactions = transactionService.getBuyerTransactions(principal.getName(), pageable);
        return ResponseEntity.ok(transactions);
    }

    // Developer xem assets đã mua thành công với fileUrl
    @GetMapping("/purchased-assets")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<Page<PurchasedAssetResponse>> getPurchasedAssets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("approvedAt").descending());
        Page<PurchasedAssetResponse> assets = transactionService.getPurchasedAssets(principal.getName(), pageable);
        return ResponseEntity.ok(assets);
    }

    // Designer xem lịch sử bán của mình
    @GetMapping("/my-sales")
    @PreAuthorize("hasRole('DESIGNER')")
    public ResponseEntity<Page<TransactionResponse>> getMySales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionResponse> transactions = transactionService.getSellerTransactions(principal.getName(), pageable);
        return ResponseEntity.ok(transactions);
    }
}
