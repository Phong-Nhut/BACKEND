package com.gamehub.dto;

public class LeaderboardResponse {

    private Long playerId;
    private String playerName;
    private Long totalPoints; // Bổ sung: Tổng điểm tích lũy
    private Integer rank;

    public LeaderboardResponse() {}

    public LeaderboardResponse(Long playerId, String playerName, Long totalPoints, Integer rank) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.totalPoints = totalPoints;
        this.rank = rank;
    }

    // Getters and Setters
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

    public Long getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Long totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}