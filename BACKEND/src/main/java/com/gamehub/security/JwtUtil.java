// Note: Xử lý tạo, xác thực, và phân tích token JWT.
package com.gamehub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    public String generateToken(String email, String role) {
        logger.debug("Generating token for email: {}, role: {}", email, role);
        logger.debug("jwtSecret: {}, jwtExpirationMs: {}", jwtSecret, jwtExpirationMs);
        try {
            if (jwtSecret == null || jwtSecret.length() < 32) {
                logger.error("Invalid jwtSecret: length is {} (must be at least 32 characters)",
                        jwtSecret == null ? 0 : jwtSecret.length());
                throw new IllegalArgumentException("JWT secret must be at least 32 characters");
            }
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("role", role)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
            logger.debug("Generated token: {}", token);
            return token;
        } catch (Exception e) {
            logger.error("Error generating token for email: {}. Exception: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid JWT token: {}", e.getMessage(), e);
            return false;
        }
    }

    private Claims getClaimsFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
