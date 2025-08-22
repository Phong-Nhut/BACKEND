// Note: Ngoại lệ tùy chỉnh cho các lỗi liên quan đến quá trình xét duyệt tài khoản.
package com.gamehub.exception;

public class ApprovalException extends RuntimeException {
    public ApprovalException(String message) {
        super(message);
    }

    public ApprovalException(String message, Throwable cause) {
        super(message, cause);
    }
}
