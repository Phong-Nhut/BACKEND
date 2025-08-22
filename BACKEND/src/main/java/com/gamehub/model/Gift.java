// Note: Entity đại diện cho bảng gifts trong MySQL, thêm trường quantity.
// Source: Cập nhật file Gift.java hiện có.
package com.gamehub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gifts")
public class Gift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "point_cost", nullable = false)
    private Long pointCost;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private User developer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Gift() {}

    public Gift(String name, String description, String imageUrl, Long pointCost, Long quantity, User developer, LocalDateTime createdAt) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.pointCost = pointCost;
        this.quantity = quantity;
        this.developer = developer;
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
