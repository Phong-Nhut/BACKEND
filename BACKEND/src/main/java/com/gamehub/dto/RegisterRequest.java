// Note: DTO định nghĩa dữ liệu gửi từ client khi đăng ký.
// Bao gồm email, password, và role với validation.
package com.gamehub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).*$", message = "Password must contain at least one letter and one number")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(GUEST|PLAYER|DEVELOPER|DESIGNER)$", message = "Invalid role. Allowed roles: GUEST, PLAYER, DEVELOPER, DESIGNER")
    private String role;

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, String role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Thông tin bổ sung cho DESIGNER và DEVELOPER
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Size(max = 255, message = "Portfolio URL must not exceed 255 characters")
    private String portfolioUrl;

    private Integer experienceYears;

    public RegisterRequest(String email, String password, String role, String fullName, String portfolioUrl, Integer experienceYears) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.portfolioUrl = portfolioUrl;
        this.experienceYears = experienceYears;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }
}
