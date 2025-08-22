// Note: Entity đại diện cho bảng gift_transactions trong MySQL.
// Source: File mới.
package com.gamehub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gift_transactions")
public class GiftTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @ManyToOne
    @JoinColumn(name = "gift_id", nullable = false)
    private Gift gift;

    @Column(name = "points_spent", nullable = false)
    private Long pointsSpent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public GiftTransaction() {}

    public GiftTransaction(User player, Gift gift, Long pointsSpent, LocalDateTime createdAt) {
        this.player = player;
        this.gift = gift;
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

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Gift getGift() {
        return gift;
    }

    public void setGift(Gift gift) {
        this.gift = gift;
    }

    public Long getPointsSpent() {
        return pointsSpent;
    }

    public void setPointsSpent(Long pointsSpent) {
        this.pointsSpent = pointsSpent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
