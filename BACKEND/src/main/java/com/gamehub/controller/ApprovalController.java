// Note: API endpoint cho Admin xét duyệt tài khoản DESIGNER và DEVELOPER.
package com.gamehub.controller;

import com.gamehub.dto.ApprovalRequest;
import com.gamehub.exception.ApprovalException;
import com.gamehub.model.User;
import com.gamehub.model.enums.UserStatus;
import com.gamehub.repository.UserRepository;
import com.gamehub.service.ApprovalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class ApprovalController {

    private static final Logger logger = LoggerFactory.getLogger(ApprovalController.class);

    @Autowired
    private ApprovalService approvalService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/approve")
    public ResponseEntity<String> approveUser(@Valid @RequestBody ApprovalRequest approvalRequest) {
        logger.info("Received approval request for user ID: {}", approvalRequest.getUserId());
        try {
            approvalService.approveUser(approvalRequest);
            return ResponseEntity.ok("User approval status updated successfully");
        } catch (ApprovalException e) {
            logger.error("Approval failed for user ID: {}", approvalRequest.getUserId(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during approval for user ID: {}", approvalRequest.getUserId(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        logger.info("Fetching list of pending users");
        try {
            List<User> pendingUsers = userRepository.findByStatus(UserStatus.PENDING);
            return ResponseEntity.ok(pendingUsers);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching pending users", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // New endpoint to get all users for the admin view
    @GetMapping("/users/all")
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching list of all users for admin");
        try {
            List<User> allUsers = userRepository.findAll();
            return ResponseEntity.ok(allUsers);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching all users", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    //API xóa tài khoản
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        logger.info("Received delete request for user ID: {}", id);
        try {
            approvalService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            logger.error("Unexpected error during user deletion for ID: {}", id, e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
