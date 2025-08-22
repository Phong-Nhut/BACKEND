// Note: DTO cho response trả về thông tin asset
package com.gamehub.dto;

import com.gamehub.model.enums.AssetStatus;
import com.gamehub.model.enums.AssetType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssetResponse {

    private Long id;
    private String name;
    private String description;
    private String fileUrl;
    private AssetType type;
    private BigDecimal price;
    private String tags;
    private String fileType;
    private AssetStatus status;
    private Long designerId;
    private String designerName;
    private LocalDateTime createdAt;

    public AssetResponse() {}

    public AssetResponse(Long id, String name, String description, String fileUrl,
                         AssetType type, BigDecimal price, String tags, String fileType,
                         AssetStatus status, Long designerId, String designerName, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.fileUrl = fileUrl;
        this.type = type;
        this.price = price;
        this.tags = tags;
        this.fileType = fileType;
        this.status = status;
        this.designerId = designerId;
        this.designerName = designerName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
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

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public AssetType getType() {
        return type;
    }

    public void setType(AssetType type) {
        this.type = type;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }

    public Long getDesignerId() {
        return designerId;
    }

    public void setDesignerId(Long designerId) {
        this.designerId = designerId;
    }

    public String getDesignerName() {
        return designerName;
    }

    public void setDesignerName(String designerName) {
        this.designerName = designerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
