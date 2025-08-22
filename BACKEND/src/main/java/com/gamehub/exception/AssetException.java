// Note: Exception class cho các lỗi liên quan đến asset operations
package com.gamehub.exception;

public class AssetException extends RuntimeException {
    public AssetException(String message) {
        super(message);
    }

    public AssetException(String message, Throwable cause) {
        super(message, cause);
    }
}
