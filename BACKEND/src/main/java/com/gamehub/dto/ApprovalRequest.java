// Note: DTO định nghĩa dữ liệu gửi từ client khi Admin xét duyệt tài khoản.
package com.gamehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ApprovalRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "Invalid status. Allowed statuses: APPROVED, REJECTED")
    private String status;

    public ApprovalRequest() {}

    public ApprovalRequest(Long userId, String status) {
        this.userId = userId;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
