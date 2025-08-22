// Note: DTO trả về thông tin giao dịch điểm cho client.
package com.gamehub.dto;

import com.gamehub.model.enums.PointActionType;

public class PointTransactionResponse {

    private Long id;
    private Long playerId;
    private Long gameId;
    private PointActionType actionType;
    private Long points;
    private String createdAt;

    public PointTransactionResponse() {}

    public PointTransactionResponse(Long id, Long playerId, Long gameId, PointActionType actionType, Long points, String createdAt) {
        this.id = id;
        this.playerId = playerId;
        this.gameId = gameId;
        this.actionType = actionType;
        this.points = points;
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

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public PointActionType getActionType() {
        return actionType;
    }

    public void setActionType(PointActionType actionType) {
        this.actionType = actionType;
    }

    public Long getPoints() {
        return points;
    }

    public void setPoints(Long points) {
        this.points = points;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
