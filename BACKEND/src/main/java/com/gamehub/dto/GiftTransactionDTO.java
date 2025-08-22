// Note: DTO trả về thông tin giao dịch đổi quà cho client.
// Source: File mới.
package com.gamehub.dto;

public class GiftTransactionDTO {

    private Long id;
    private Long playerId;
    private Long giftId;
    private Long pointsSpent;
    private String createdAt;

    public GiftTransactionDTO() {}

    public GiftTransactionDTO(Long id, Long playerId, Long giftId, Long pointsSpent, String createdAt) {
        this.id = id;
        this.playerId = playerId;
        this.giftId = giftId;
        this.pointsSpent = pointsSpent;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public Long getGiftId() {
        return giftId;
    }

    public void setGiftId(Long giftId) {
        this.giftId = giftId;
    }

    public Long getPointsSpent() {
        return pointsSpent;
    }

    public void setPointsSpent(Long pointsSpent) {
        this.pointsSpent = pointsSpent;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
