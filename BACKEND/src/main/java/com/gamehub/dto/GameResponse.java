// Note: DTO trả về thông tin game cho client.
package com.gamehub.dto;

import com.gamehub.model.enums.GameStatus;

public class GameResponse {

    private Long id;
    private String name;
    private String description;
    private String requirements;
    private String previewImageUrl;
    private String apkFileUrl;
    private boolean supportLeaderboard;
    private boolean supportPoints;
    private GameStatus status;
    private Long developerId;
    private String apiKeyMessage;

    public GameResponse() {}

    public GameResponse(Long id, String name, String description, String requirements, String previewImageUrl,
                        String apkFileUrl, boolean supportLeaderboard, boolean supportPoints, GameStatus status,
                        Long developerId, String apiKeyMessage) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.requirements = requirements;
        this.previewImageUrl = previewImageUrl;
        this.apkFileUrl = apkFileUrl;
        this.supportLeaderboard = supportLeaderboard;
        this.supportPoints = supportPoints;
        this.status = status;
        this.developerId = developerId;
        this.apiKeyMessage = apiKeyMessage;
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

    public Long getDeveloperId() {
        return developerId;
    }

    public void setDeveloperId(Long developerId) {
        this.developerId = developerId;
    }

    public String getApiKeyMessage() {
        return apiKeyMessage;
    }

    public void setApiKeyMessage(String apiKeyMessage) {
        this.apiKeyMessage = apiKeyMessage;
    }
}
