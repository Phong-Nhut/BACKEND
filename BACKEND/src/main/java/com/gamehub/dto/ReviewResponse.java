// Note: DTO trả về thông tin review cho client.
package com.gamehub.dto;

import com.gamehub.model.enums.ReviewStatus;

public class ReviewResponse {

    private Long id;
    private Long playerId;
    private String playerName;
    private Long gameId;
    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private String createdAt;

    public ReviewResponse() {}

    public ReviewResponse(Long id, Long playerId, String playerName, Long gameId, Integer rating, String comment, ReviewStatus status, String createdAt) {
        this.id = id;
        this.playerId = playerId;
        this.playerName = playerName;
        this.gameId = gameId;
        this.rating = rating;
        this.comment = comment;
        this.status = status;
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

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ReviewStatus status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
