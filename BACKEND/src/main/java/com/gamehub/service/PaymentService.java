// Note: Service xử lý logic nghiệp vụ cho hệ thống thanh toán
// Chức năng: Quản lý thông tin thanh toán admin, xử lý yêu cầu nạp tiền developer
package com.gamehub.service;

import com.gamehub.dto.DepositApprovalRequest;
import com.gamehub.dto.DepositResponse;
import com.gamehub.dto.PaymentInfoRequest;
import com.gamehub.exception.ResourceNotFoundException;
import com.gamehub.model.DepositRequest;
import com.gamehub.model.PaymentInfo;
import com.gamehub.model.User;
import com.gamehub.model.enums.DepositStatus;
import com.gamehub.repository.DepositRequestRepository;
import com.gamehub.repository.PaymentInfoRepository;
import com.gamehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentInfoRepository paymentInfoRepository;

    @Autowired
    private DepositRequestRepository depositRequestRepository;

    @Autowired
    private UserRepository userRepository;

    // Payment Info Management (Admin)
    public PaymentInfo createOrUpdatePaymentInfo(PaymentInfoRequest request) {
        Optional<PaymentInfo> existingInfo = paymentInfoRepository.findByIsActiveTrue();

        PaymentInfo paymentInfo;
        if (existingInfo.isPresent()) {
            paymentInfo = existingInfo.get();
            paymentInfo.setAccountNumber(request.getAccountNumber());
            paymentInfo.setBankName(request.getBankName());
            paymentInfo.setAccountHolderName(request.getAccountHolderName());
            paymentInfo.setQrCodeUrl(request.getQrCodeUrl());
        } else {
            paymentInfo = new PaymentInfo(
                    null, // user is null for admin-created payment info
                    request.getAccountNumber(),
                    request.getBankName(),
                    request.getAccountHolderName(),
                    request.getQrCodeUrl()
            );
        }

        return paymentInfoRepository.save(paymentInfo);
    }

    // Payment Info Management (User-specific)
    public PaymentInfo createOrUpdatePaymentInfo(User user, PaymentInfoRequest request) {
        Optional<PaymentInfo> existingInfo = paymentInfoRepository.findByUser(user);

        PaymentInfo paymentInfo;
        if (existingInfo.isPresent()) {
            paymentInfo = existingInfo.get();
            paymentInfo.setAccountNumber(request.getAccountNumber());
            paymentInfo.setBankName(request.getBankName());
            paymentInfo.setAccountHolderName(request.getAccountHolderName());
            paymentInfo.setQrCodeUrl(request.getQrCodeUrl());
        } else {
            paymentInfo = new PaymentInfo(
                    user,
                    request.getAccountNumber(),
                    request.getBankName(),
                    request.getAccountHolderName(),
                    request.getQrCodeUrl()
            );
        }

        return paymentInfoRepository.save(paymentInfo);
    }

    public Optional<PaymentInfo> getUserPaymentInfo(User user) {
        return paymentInfoRepository.findByUserAndIsActiveTrue(user);
    }

    public Optional<PaymentInfo> getActivePaymentInfo() {
        return paymentInfoRepository.findByIsActiveTrue();
    }

    // Deposit Request Management
    public DepositRequest createDepositRequest(User user, com.gamehub.dto.DepositRequest request) {
        DepositRequest depositRequest = new DepositRequest(
                user,
                new BigDecimal(request.getAmount()),
                request.getTransactionNote()
        );

        return depositRequestRepository.save(depositRequest);
    }

    public Page<DepositRequest> getPendingDepositRequests(Pageable pageable) {
        return depositRequestRepository.findByStatus(DepositStatus.PENDING, pageable);
    }

    public Page<DepositRequest> getUserDepositRequests(User user, Pageable pageable) {
        return depositRequestRepository.findByUser(user, pageable);
    }

    @Transactional
    public DepositRequest approveDepositRequest(Long requestId, User admin, DepositApprovalRequest approvalRequest) {
        DepositRequest depositRequest = depositRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit request not found"));

        if (depositRequest.getStatus() != DepositStatus.PENDING) {
            throw new IllegalStateException("Deposit request is not in pending status");
        }

        depositRequest.setStatus(approvalRequest.getStatus());
        depositRequest.setAdminNote(approvalRequest.getAdminNote());
        depositRequest.setApprovedBy(admin);
        depositRequest.setApprovedAt(LocalDateTime.now());

        // Nếu duyệt thành công, cộng tiền vào tài khoản user
        if (approvalRequest.getStatus() == DepositStatus.APPROVED) {
            User user = depositRequest.getUser();
            user.setBalance(user.getBalance().add(depositRequest.getAmount()));
            userRepository.save(user);
        }

        return depositRequestRepository.save(depositRequest);
    }

    public DepositRequest getDepositRequestById(Long id) {
        return depositRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit request not found"));
    }

    public DepositResponse convertToDepositResponse(DepositRequest depositRequest) {
        DepositResponse response = new DepositResponse();
        response.setId(depositRequest.getId());
        response.setUserId(depositRequest.getUser().getId());
        response.setUserEmail(depositRequest.getUser().getEmail());
        response.setUserName(depositRequest.getUser().getFullName());
        response.setAmount(depositRequest.getAmount());
        response.setStatus(depositRequest.getStatus());
        response.setTransactionNote(depositRequest.getTransactionNote());
        response.setAdminNote(depositRequest.getAdminNote());

        if (depositRequest.getApprovedBy() != null) {
            response.setApprovedById(depositRequest.getApprovedBy().getId());
            response.setApprovedByEmail(depositRequest.getApprovedBy().getEmail());
        }

        response.setApprovedAt(depositRequest.getApprovedAt());
        response.setCreatedAt(depositRequest.getCreatedAt());
        response.setUpdatedAt(depositRequest.getUpdatedAt());

        return response;
    }
}
