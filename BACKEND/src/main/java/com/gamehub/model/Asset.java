// Note: Entity đại diện cho bảng assets trong MySQL, lưu thông tin assets do Graphic Designer upload.
// Đường dẫn: /api/v1/assets - Quản lý upload và xem danh sách assets
package com.gamehub.model;

import com.gamehub.model.enums.AssetStatus;
import com.gamehub.model.enums.AssetType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type; // FREE hoặc PAID

    @Column(precision = 10, scale = 2)
    private BigDecimal price; // Giá nếu là PAID

    @Column(columnDefinition = "TEXT")
    private String tags; // Lưu dưới dạng chuỗi phân cách bằng dấu phẩy

    @Column(name = "file_type", nullable = false)
    private String fileType; // SVG hoặc MP3

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status; // PENDING, APPROVED, REJECTED

    @ManyToOne
    @JoinColumn(name = "designer_id", nullable = false)
    private User designer;

    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Asset() {}

    public Asset(String name, String description, String fileUrl, AssetType type,
                 BigDecimal price, String tags, String fileType, AssetStatus status, User designer) {
        this.name = name;
        this.description = description;
        this.fileUrl = fileUrl;
        this.type = type;
        this.price = price;
        this.tags = tags;
        this.fileType = fileType;
        this.status = status;
        this.designer = designer;
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

    public User getDesigner() {
        return designer;
    }

    public void setDesigner(User designer) {
        this.designer = designer;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
