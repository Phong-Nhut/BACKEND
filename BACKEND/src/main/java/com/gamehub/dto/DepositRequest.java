// Note: DTO cho request tạo yêu cầu nạp tiền
package com.gamehub.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class DepositRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Amount must be at least 1.0")
    private Double amount;

    private String transactionNote;

    public DepositRequest() {}

    public DepositRequest(Double amount, String transactionNote) {
        this.amount = amount;
        this.transactionNote = transactionNote;
    }

    // Getters and Setters
    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionNote() {
        return transactionNote;
    }

    public void setTransactionNote(String transactionNote) {
        this.transactionNote = transactionNote;
    }
}
