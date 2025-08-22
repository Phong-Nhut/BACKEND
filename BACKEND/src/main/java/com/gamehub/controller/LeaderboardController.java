package com.gamehub.controller;

import com.gamehub.dto.LeaderboardResponse;
import com.gamehub.service.LeaderboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardController.class);

    @Autowired
    private LeaderboardService leaderboardService;

    // Bổ sung: Endpoint để lấy bảng xếp hạng 10 người chơi hàng đầu cho một developer
    @GetMapping("/developer/{developerId}")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboardByDeveloper(
            @PathVariable Long developerId,
            Authentication authentication) {

        logger.info("Get leaderboard request for DeveloperID={}", developerId);

        // Kiểm tra quyền truy cập (chỉ developer hoặc admin được phép)
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("DEVELOPER") || auth.getAuthority().equals("ADMIN"))) {
            logger.warn("Unauthorized leaderboard access attempt: DeveloperID={}", developerId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<LeaderboardResponse> leaderboard = leaderboardService.getLeaderboardByDeveloper(developerId);
            logger.info("Retrieved leaderboard with {} players for DeveloperID={}", leaderboard.size(), developerId);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            logger.error("Error retrieving leaderboard for DeveloperID={}: {}", developerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}