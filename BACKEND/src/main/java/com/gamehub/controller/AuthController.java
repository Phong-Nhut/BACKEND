// Note: Xử lý các request HTTP cho đăng nhập và đăng ký.
// Cung cấp endpoint /api/v1/auth/register và /api/v1/auth/login.
package com.gamehub.controller;

import com.gamehub.dto.AuthResponse;
import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.RegisterRequest;
import com.gamehub.exception.AuthenticationException;
import com.gamehub.exception.RegistrationException;
import com.gamehub.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest registerRequest,
                                      BindingResult bindingResult) {
        logger.info("Registration request received for email: {}", registerRequest.getEmail());
        Map<String, Object> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            response.put("message", "Validation failed");
            response.put("errors", bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage()
                    )));
            logger.warn("Registration validation failed for email: {}", registerRequest.getEmail());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            AuthResponse authResponse = authService.register(registerRequest);
            response.put("message", "Registration successful");
            response.put("token", authResponse.getToken());
            response.put("role", authResponse.getRole());
            response.put("email", authResponse.getEmail());
            response.put("id", authResponse.getId()); // Thêm id
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RegistrationException e) {
            response.put("message", e.getMessage());
            logger.error("Registration failed for email: {}", registerRequest.getEmail(), e);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("message", "Internal server error");
            logger.error("Unexpected error during registration for email: {}", registerRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest loginRequest,
                                   BindingResult bindingResult) {
        logger.info("Login request received for email: {}", loginRequest.getEmail());
        Map<String, Object> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            response.put("message", "Validation failed");
            response.put("errors", bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage()
                    )));
            logger.warn("Login validation failed for email: {}", loginRequest.getEmail());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            AuthResponse authResponse = authService.login(loginRequest);
            response.put("message", "Login successful");
            response.put("token", authResponse.getToken());
            response.put("role", authResponse.getRole());
            response.put("email", authResponse.getEmail());
            response.put("id", authResponse.getId()); // Thêm id
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            response.put("message", e.getMessage());
            logger.error("Login failed for email: {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("message", "Internal server error");
            logger.error("Unexpected error during login for email: {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
