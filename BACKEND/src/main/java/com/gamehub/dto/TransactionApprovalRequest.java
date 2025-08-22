// Note: DTO cho admin duyệt/từ chối giao dịch
package com.gamehub.dto;

public class TransactionApprovalRequest {

    private String rejectionReason; // Tùy chọn, chỉ cần khi từ chối

    public TransactionApprovalRequest() {}

    public TransactionApprovalRequest(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}

