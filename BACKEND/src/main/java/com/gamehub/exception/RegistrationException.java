// Note: Exception tùy chỉnh để xử lý lỗi đăng ký (email đã tồn tại, vai trò không hợp lệ).
package com.gamehub.exception;

public class RegistrationException extends Exception {

    public RegistrationException(String message) {
        super(message);
    }

    public RegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
