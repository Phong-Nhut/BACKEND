// Note: DTO cho request duyệt yêu cầu nạp tiền
package com.gamehub.dto;

import com.gamehub.model.enums.DepositStatus;
import jakarta.validation.constraints.NotNull;

public class DepositApprovalRequest {

    @NotNull(message = "Status is required")
    private DepositStatus status;

    private String adminNote;

    public DepositApprovalRequest() {}

    public DepositApprovalRequest(DepositStatus status, String adminNote) {
        this.status = status;
        this.adminNote = adminNote;
    }

    // Getters and Setters
    public DepositStatus getStatus() {
        return status;
    }

    public void setStatus(DepositStatus status) {
        this.status = status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
