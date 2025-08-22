// Note: Entity đại diện cho bảng transactions trong MySQL, lưu thông tin giao dịch mua bán assets
// Đường dẫn: /api/v1/transactions - Quản lý giao dịch mua bán assets với phí nền tảng 10%
package com.gamehub.model;

import com.gamehub.model.enums.TransactionStatus;
import com.gamehub.model.enums.TransactionType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // ASSET_PURCHASE

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal amount; // Số tiền VND (không có phần thập phân)

    @Column(name = "platform_fee", nullable = false, precision = 15, scale = 0)
    private BigDecimal platformFee; // Phí nền tảng 10% (VND)

    @Column(name = "designer_amount", nullable = false, precision = 15, scale = 0)
    private BigDecimal designerAmount; // Số tiền designer nhận được sau khi trừ phí (VND)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // PENDING, APPROVED, REJECTED

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer; // Developer mua asset

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller; // Designer bán asset

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset; // Asset được mua

    @Column(name = "file_url", length = 255)
    private String fileUrl; // URL của file tài sản

    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private User approvedBy; // Admin duyệt giao dịch

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Transaction() {}

    public Transaction(TransactionType type, BigDecimal amount, BigDecimal platformFee,
                       BigDecimal designerAmount, TransactionStatus status, User buyer,
                       User seller, Asset asset, String fileUrl) {
        this.type = type;
        this.amount = amount;
        this.platformFee = platformFee;
        this.designerAmount = designerAmount;
        this.status = status;
        this.buyer = buyer;
        this.seller = seller;
        this.asset = asset;
        this.fileUrl = fileUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getDesignerAmount() {
        return designerAmount;
    }

    public void setDesignerAmount(BigDecimal designerAmount) {
        this.designerAmount = designerAmount;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
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
