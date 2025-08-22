// Note: Xử lý logic xét duyệt game bởi Admin.
package com.gamehub.service;

import com.gamehub.dto.GameApprovalRequest;
import com.gamehub.exception.GameException;
import com.gamehub.model.Game;
import com.gamehub.model.enums.GameStatus;
import com.gamehub.repository.GameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GameApprovalService {

    private static final Logger logger = LoggerFactory.getLogger(GameApprovalService.class);

    @Autowired
    private GameRepository gameRepository;

    public void approveGame(GameApprovalRequest approvalRequest) throws GameException {
        logger.info("Game approval attempt for game ID: {}", approvalRequest.getGameId());

        Game game = gameRepository.findById(approvalRequest.getGameId())
                .orElseThrow(() -> {
                    logger.warn("Approval failed - game not found: {}", approvalRequest.getGameId());
                    return new GameException("Game not found");
                });

        if (game.getStatus() != GameStatus.PENDING) {
            logger.warn("Approval failed - game is not in PENDING status: {}", game.getStatus());
            throw new GameException("Game is not in PENDING status");
        }

        GameStatus status;
        try {
            logger.debug("Parsing status: {}", approvalRequest.getStatus());
            status = GameStatus.valueOf(approvalRequest.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid status: {}", approvalRequest.getStatus(), e);
            throw new GameException("Invalid status. Allowed statuses: APPROVED, REJECTED");
        }

        game.setStatus(status);
        try {
            gameRepository.save(game);
            logger.info("Game approval status updated successfully: ID={}, Status={}", game.getId(), status);
        } catch (Exception e) {
            logger.error("Error updating game approval status: {}", game.getId(), e);
            throw new GameException("Error updating game status");
        }
    }
}
