// Note: Controller xử lý các API liên quan đến duyệt game bởi Admin.
package com.gamehub.controller;

import com.gamehub.dto.GameApprovalRequest;
import com.gamehub.exception.GameException;
import com.gamehub.model.Game;
import com.gamehub.model.enums.GameStatus;
import com.gamehub.repository.GameRepository;
import com.gamehub.service.GameApprovalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class GameApprovalController {

    private static final Logger logger = LoggerFactory.getLogger(GameApprovalController.class);

    @Autowired
    private GameApprovalService gameApprovalService;

    @Autowired
    private GameRepository gameRepository; // Inject repository for new endpoints

    @PostMapping("/game-approve")
    public ResponseEntity<String> approveGame(@Valid @RequestBody GameApprovalRequest approvalRequest) throws GameException {
        logger.info("Game approval request for game ID: {}", approvalRequest.getGameId());
        gameApprovalService.approveGame(approvalRequest);
        return ResponseEntity.ok("Game approval status updated successfully");
    }

    // New dedicated endpoint to get pending games
    @GetMapping("/games/pending")
    public ResponseEntity<List<Game>> getPendingGames() {
        logger.info("Fetching list of pending games for admin");
        try {
            List<Game> pendingGames = gameRepository.findByStatus(GameStatus.PENDING);
            return ResponseEntity.ok(pendingGames);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching pending games", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // New endpoint to get all games for the admin view
    @GetMapping("/games/all")
    public ResponseEntity<List<Game>> getAllGames() {
        logger.info("Fetching list of all games for admin");
        try {
            List<Game> allGames = gameRepository.findAll();
            return ResponseEntity.ok(allGames);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching all games", e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
