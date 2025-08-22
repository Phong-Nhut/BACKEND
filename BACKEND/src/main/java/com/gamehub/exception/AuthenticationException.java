// Note: Exception tùy chỉnh để xử lý lỗi xác thực (sai email/password).
package com.gamehub.exception;

public class AuthenticationException extends Exception {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
