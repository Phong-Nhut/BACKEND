// Note: DTO response cho assets đã mua thành công, bao gồm fileUrl để developer có thể download
// Đường dẫn: /api/v1/transactions/purchased-assets - Developer xem assets đã mua với fileUrl
package com.gamehub.dto;

import com.gamehub.model.enums.AssetType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PurchasedAssetResponse {
    private Long assetId;
    private String assetName;
    private String description;
    private String fileUrl; // URL để download file
    private AssetType type;
    private BigDecimal price;
    private String tags;
    private String fileType;
    private String designerEmail;
    private LocalDateTime purchasedAt;
    private Long transactionId;

    public PurchasedAssetResponse() {}

    public PurchasedAssetResponse(Long assetId, String assetName, String description, String fileUrl,
                                  AssetType type, BigDecimal price, String tags, String fileType,
                                  String designerEmail, LocalDateTime purchasedAt, Long transactionId) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.description = description;
        this.fileUrl = fileUrl;
        this.type = type;
        this.price = price;
        this.tags = tags;
        this.fileType = fileType;
        this.designerEmail = designerEmail;
        this.purchasedAt = purchasedAt;
        this.transactionId = transactionId;
    }

    // Getters and Setters
    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
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

    public String getDesignerEmail() {
        return designerEmail;
    }

    public void setDesignerEmail(String designerEmail) {
        this.designerEmail = designerEmail;
    }

    public LocalDateTime getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(LocalDateTime purchasedAt) {
        this.purchasedAt = purchasedAt;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }
}
