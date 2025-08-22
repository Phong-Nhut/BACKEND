// Note: DTO cho response giao dịch, tránh trả về entity trực tiếp
package com.gamehub.dto;

import com.gamehub.model.enums.TransactionStatus;
import com.gamehub.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private Long id;
    private TransactionType type;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal designerAmount;
    private TransactionStatus status;
    private String buyerEmail;
    private String sellerEmail;
    private String assetName;
    private String approvedByEmail;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;

    public TransactionResponse() {}

    public TransactionResponse(Long id, TransactionType type, BigDecimal amount,
                               BigDecimal platformFee, BigDecimal designerAmount,
                               TransactionStatus status, String buyerEmail, String sellerEmail,
                               String assetName, String approvedByEmail, LocalDateTime approvedAt,
                               String rejectionReason, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.platformFee = platformFee;
        this.designerAmount = designerAmount;
        this.status = status;
        this.buyerEmail = buyerEmail;
        this.sellerEmail = sellerEmail;
        this.assetName = assetName;
        this.approvedByEmail = approvedByEmail;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
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

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getApprovedByEmail() {
        return approvedByEmail;
    }

    public void setApprovedByEmail(String approvedByEmail) {
        this.approvedByEmail = approvedByEmail;
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
