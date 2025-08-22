// Note: Entity đại diện cho bảng games trong MySQL, lưu thông tin game do Developer upload.
package com.gamehub.model;

import com.gamehub.model.enums.GameStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(name = "apk_file_url")
    private String apkFileUrl;

    @Column(name = "support_leaderboard", nullable = false)
    private boolean supportLeaderboard;

    @Column(name = "support_points", nullable = false)
    private boolean supportPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private User developer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Game() {}

    public Game(String name, String description, String requirements, String previewImageUrl, String apkFileUrl,
                boolean supportLeaderboard, boolean supportPoints, GameStatus status, User developer) {
        this.name = name;
        this.description = description;
        this.requirements = requirements;
        this.previewImageUrl = previewImageUrl;
        this.apkFileUrl = apkFileUrl;
        this.supportLeaderboard = supportLeaderboard;
        this.supportPoints = supportPoints;
        this.status = status;
        this.developer = developer;
    }

    // Getters và Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getPreviewImageUrl() {
        return previewImageUrl;
    }

    public void setPreviewImageUrl(String previewImageUrl) {
        this.previewImageUrl = previewImageUrl;
    }

    public String getApkFileUrl() {
        return apkFileUrl;
    }

    public void setApkFileUrl(String apkFileUrl) {
        this.apkFileUrl = apkFileUrl;
    }

    public boolean isSupportLeaderboard() {
        return supportLeaderboard;
    }

    public void setSupportLeaderboard(boolean supportLeaderboard) {
        this.supportLeaderboard = supportLeaderboard;
    }

    public boolean isSupportPoints() {
        return supportPoints;
    }

    public void setSupportPoints(boolean supportPoints) {
        this.supportPoints = supportPoints;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public User getDeveloper() {
        return developer;
    }

    public void setDeveloper(User developer) {
        this.developer = developer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
