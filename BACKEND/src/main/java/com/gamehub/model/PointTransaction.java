// Note: Entity đại diện cho bảng point_transactions trong MySQL.
package com.gamehub.model;

import com.gamehub.model.enums.PointActionType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private PointActionType actionType;

    @Column(nullable = false)
    private Long points;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public PointTransaction() {}

    public PointTransaction(User player, Game game, PointActionType actionType, Long points, LocalDateTime createdAt) {
        this.player = player;
        this.game = game;
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

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
