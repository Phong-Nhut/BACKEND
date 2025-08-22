// Note: Xử lý logic đăng nhập và đăng ký.
// Kiểm tra email, mã hóa mật khẩu, tạo token JWT.
package com.gamehub.service;

import com.gamehub.dto.AuthResponse;
import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.RegisterRequest;
import com.gamehub.exception.AuthenticationException;
import com.gamehub.exception.RegistrationException;
import com.gamehub.model.User;
import com.gamehub.model.enums.UserRole;
import com.gamehub.model.enums.UserStatus;
import com.gamehub.repository.UserRepository;
import com.gamehub.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest registerRequest) throws RegistrationException {
        logger.info("Registration attempt for email: {}", registerRequest.getEmail());
        logger.debug("Input: email={}, role={}", registerRequest.getEmail(), registerRequest.getRole());
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            logger.warn("Registration failed - email already exists: {}", registerRequest.getEmail());
            throw new RegistrationException("Email already exists");
        }

        UserRole role;
        try {
            logger.debug("Parsing role: {}", registerRequest.getRole());
            role = UserRole.valueOf(registerRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid role: {}", registerRequest.getRole(), e);
            throw new RegistrationException("Invalid role. Allowed roles: GUEST, PLAYER, DEVELOPER, DESIGNER");
        }

        if (role == UserRole.ADMIN) {
            logger.warn("Admin role not allowed for email: {}", registerRequest.getEmail());
            throw new RegistrationException("Admin registration is not allowed via public API");
        }

        // Kiểm tra thông tin bổ sung cho DESIGNER và DEVELOPER
        if (role == UserRole.DESIGNER || role == UserRole.DEVELOPER) {
            if (registerRequest.getFullName() == null || registerRequest.getFullName().isEmpty()) {
                logger.warn("Registration failed - full name required for role: {}", role);
                throw new RegistrationException("Full name is required for DESIGNER and DEVELOPER roles");
            }
            if (registerRequest.getPortfolioUrl() == null || registerRequest.getPortfolioUrl().isEmpty()) {
                logger.warn("Registration failed - portfolio URL required for role: {}", role);
                throw new RegistrationException("Portfolio URL is required for DESIGNER and DEVELOPER roles");
            }
            if (registerRequest.getExperienceYears() == null || registerRequest.getExperienceYears() < 0) {
                logger.warn("Registration failed - valid experience years required for role: {}", role);
                throw new RegistrationException("Experience years must be provided and non-negative for DESIGNER and DEVELOPER roles");
            }
        }

        User user = new User(
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                role,
                registerRequest.getFullName(),
                registerRequest.getPortfolioUrl(),
                registerRequest.getExperienceYears(),
                (role == UserRole.DESIGNER || role == UserRole.DEVELOPER) ? UserStatus.PENDING : UserStatus.APPROVED
        );

        logger.debug("Saving user: {}", user.getEmail());
        try {
            userRepository.save(user);
            logger.info("User created successfully with ID: {}", user.getId());
        } catch (Exception e) {
            logger.error("Error saving user: {}", user.getEmail(), e);
            throw e;
        }

        String token;
        try {
            token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            logger.info("Registration successful for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error generating token for user: {}", user.getEmail(), e);
            throw e;
        }

        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getId());
    }

    public AuthResponse login(LoginRequest loginRequest) throws AuthenticationException {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed - user not found: {}", loginRequest.getEmail());
                    return new AuthenticationException("Invalid credentials");
                });

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            logger.warn("Login failed - invalid password for user: {}", loginRequest.getEmail());
            throw new AuthenticationException("Invalid credentials");
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            logger.warn("Login failed - user is not approved: {}", loginRequest.getEmail());
            throw new AuthenticationException("Account is not approved. Please wait for admin approval.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        logger.info("Login successful for user: {}", user.getEmail());
        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getId());
    }
}
