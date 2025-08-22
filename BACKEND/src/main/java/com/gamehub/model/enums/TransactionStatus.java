// Note: Enum định nghĩa trạng thái giao dịch (chờ duyệt, đã duyệt, từ chối)
package com.gamehub.model.enums;

public enum TransactionStatus {
    PENDING,   // Chờ admin duyệt
    APPROVED,  // Đã duyệt - tiền đã được chuyển
    REJECTED   // Từ chối - hoàn tiền cho buyer
}
