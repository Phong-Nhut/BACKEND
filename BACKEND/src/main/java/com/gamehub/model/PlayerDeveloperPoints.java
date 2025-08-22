package com.gamehub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_developer_points", uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "developer_id"}))
public class PlayerDeveloperPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private User developer;

    @Column(nullable = false)
    private Long totalPoints;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    public PlayerDeveloperPoints() {}

    public PlayerDeveloperPoints(User player, User developer, Long totalPoints, LocalDateTime lastUpdated) {
        this.player = player;
        this.developer = developer;
        this.totalPoints = totalPoints;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public User getDeveloper() {
        return developer;
    }

    public void setDeveloper(User developer) {
        this.developer = developer;
    }

    public Long getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Long totalPoints) {
        this.totalPoints = totalPoints;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
