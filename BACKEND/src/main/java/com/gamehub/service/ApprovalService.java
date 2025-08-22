// Note: Xử lý logic xét duyệt tài khoản DESIGNER và DEVELOPER bởi Admin.
package com.gamehub.service;

import com.gamehub.dto.ApprovalRequest;
import com.gamehub.exception.ApprovalException;
import com.gamehub.model.User;
import com.gamehub.model.enums.UserRole;
import com.gamehub.model.enums.UserStatus;
import com.gamehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApprovalService {

    private static final Logger logger = LoggerFactory.getLogger(ApprovalService.class);

    @Autowired
    private UserRepository userRepository;

    public void approveUser(ApprovalRequest approvalRequest) throws ApprovalException {
        logger.info("Approval attempt for user ID: {}", approvalRequest.getUserId());

        User user = userRepository.findById(approvalRequest.getUserId())
                .orElseThrow(() -> {
                    logger.warn("Approval failed - user not found: {}", approvalRequest.getUserId());
                    return new ApprovalException("User not found");
                });

        if (user.getRole() != UserRole.DESIGNER && user.getRole() != UserRole.DEVELOPER) {
            logger.warn("Approval failed - invalid role for approval: {}", user.getRole());
            throw new ApprovalException("Only DESIGNER and DEVELOPER accounts can be approved");
        }

        if (user.getStatus() != UserStatus.PENDING) {
            logger.warn("Approval failed - user is not in PENDING status: {}", user.getStatus());
            throw new ApprovalException("User is not in PENDING status");
        }

        UserStatus status;
        try {
            logger.debug("Parsing status: {}", approvalRequest.getStatus());
            status = UserStatus.valueOf(approvalRequest.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid status: {}", approvalRequest.getStatus(), e);
            throw new ApprovalException("Invalid status. Allowed statuses: APPROVED, REJECTED");
        }

        user.setStatus(status);
        try {
            userRepository.save(user);
            logger.info("User approval status updated successfully: ID={}, Status={}", user.getId(), status);
        } catch (Exception e) {
            logger.error("Error updating user approval status: {}", user.getId(), e);
            throw e;
        }
    }

    //hàm xóa tài khoản (ADMIN)
    public void deleteUser(Long userId) throws ApprovalException {
        logger.info("Delete attempt for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Delete failed - user not found: {}", userId);
                    return new ApprovalException("User not found");
                });

        try {
            userRepository.delete(user);
            logger.info("User deleted successfully: ID={}, Email={}", user.getId(), user.getEmail());
        } catch (Exception e) {
            logger.error("Error deleting user: {}", user.getId(), e);
            throw new ApprovalException("Error deleting user");
        }
    }
}
