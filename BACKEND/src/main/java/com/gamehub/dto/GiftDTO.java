// Note: DTO trả về thông tin quà tặng cho client, thêm quantity.
// Source: Cập nhật file GiftDTO.java hiện có.
package com.gamehub.dto;

public class GiftDTO {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long pointCost;
    private Long quantity;
    private Long developerId;
    private String createdAt;

    public GiftDTO() {}

    public GiftDTO(Long id, String name, String description, String imageUrl, Long pointCost, Long quantity, Long developerId, String createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.pointCost = pointCost;
        this.quantity = quantity;
        this.developerId = developerId;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getPointCost() {
        return pointCost;
    }

    public void setPointCost(Long pointCost) {
        this.pointCost = pointCost;
    }

    public Long getQuantity() {
        return quantity;
    }

    public void setQuantity(Long quantity) {
        this.quantity = quantity;
    }

    public Long getDeveloperId() {
        return developerId;
    }

    public void setDeveloperId(Long developerId) {
        this.developerId = developerId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
