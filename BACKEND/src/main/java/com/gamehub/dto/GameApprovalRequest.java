// Note: DTO định nghĩa dữ liệu gửi từ client khi Admin xét duyệt game.
package com.gamehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class GameApprovalRequest {

    @NotNull(message = "Game ID is required")
    private Long gameId;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "Invalid status. Allowed statuses: APPROVED, REJECTED")
    private String status;

    public GameApprovalRequest() {}

    public GameApprovalRequest(Long gameId, String status) {
        this.gameId = gameId;
        this.status = status;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
