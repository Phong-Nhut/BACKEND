// Note: Lớp ngoại lệ tùy chỉnh cho các lỗi liên quan đến game.
package com.gamehub.exception;

public class GameException extends RuntimeException {
    public GameException(String message) {
        super(message);
    }

    public GameException(String message, Throwable cause) {
        super(message, cause);
    }
}
