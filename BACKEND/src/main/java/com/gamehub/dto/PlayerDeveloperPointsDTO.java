package com.gamehub.dto;

public class PlayerDeveloperPointsDTO {

    private Long id; // playerId or developerId tùy context
    private Long points;

    public PlayerDeveloperPointsDTO() {}

    public PlayerDeveloperPointsDTO(Long id, Long points) {
        this.id = id;
        this.points = points;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPoints() {
        return points;
    }

    public void setPoints(Long points) {
        this.points = points;
    }
}
