// Note: Xử lý logic tích điểm cho người chơi (tải game, viết review).
package com.gamehub.service;

import com.gamehub.dto.PlayerDeveloperPointsDTO;
import com.gamehub.exception.GameException;
import com.gamehub.model.Game;
import com.gamehub.model.PlayerDeveloperPoints;
import com.gamehub.model.PointTransaction;
import com.gamehub.model.User;
import com.gamehub.model.enums.PointActionType;
import com.gamehub.model.enums.UserRole;
import com.gamehub.repository.GameRepository;
import com.gamehub.repository.PointTransactionRepository;
import com.gamehub.repository.UserRepository;
import com.gamehub.repository.PlayerDeveloperPointsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PointService {

    private static final Logger logger = LoggerFactory.getLogger(PointService.class);

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PlayerDeveloperPointsRepository playerDeveloperPointsRepository;

    public void awardPoints(Long playerId, Long gameId, String actionType, Long points) throws GameException {
        logger.info("Awarding {} points to player {} for action {}", points, playerId, actionType);

        User player = userRepository.findById(playerId)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", playerId);
                    return new GameException("User not found");
                });

        if (gameId == null) {
            throw new GameException("Game ID is required for points award");
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> {
                    logger.warn("Game not found: {}", gameId);
                    return new GameException("Game not found");
                });
        if (!game.isSupportPoints()) {
            logger.warn("Game does not support points: {}", gameId);
            throw new GameException("Game does not support points");
        }

        User developer = game.getDeveloper();
        if (developer == null || !developer.getRole().equals(UserRole.DEVELOPER)) {
            throw new GameException("Invalid developer for game");
        }

        PointActionType pointActionType;
        try {
            pointActionType = PointActionType.valueOf(actionType.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid action type: {}", actionType);
            throw new GameException("Invalid action type");
        }

        // Default points based on action if not provided
        if (points == null) {
            points = (pointActionType == PointActionType.DOWNLOAD_GAME || pointActionType == PointActionType.WRITE_REVIEW) ? 20L : 0L;
        }

        // Kiểm tra duplicate action per game per player
        if (pointTransactionRepository.existsByPlayerIdAndGameIdAndActionType(playerId, gameId, pointActionType)) {
            logger.warn("Points already awarded for player {} and game {} for action {}", playerId, gameId, actionType);
            throw new GameException("Points already awarded for this action");
        }

        PointTransaction transaction = new PointTransaction(
                player,
                game,
                pointActionType,
                points,
                LocalDateTime.now()
        );

        try {
            pointTransactionRepository.save(transaction);

            // Update per developer total
            Optional<PlayerDeveloperPoints> optionalPdp = playerDeveloperPointsRepository.findByPlayerAndDeveloper(player, developer);
            PlayerDeveloperPoints pdp = optionalPdp.orElse(new PlayerDeveloperPoints(player, developer, 0L, LocalDateTime.now()));
            pdp.setTotalPoints(pdp.getTotalPoints() + points);
            pdp.setLastUpdated(LocalDateTime.now());
            playerDeveloperPointsRepository.save(pdp);

            logger.info("Points awarded successfully: PlayerID={}, Points={}, Action={}, DeveloperID={}", playerId, points, actionType, developer.getId());
        } catch (Exception e) {
            logger.error("Error awarding points: {}", e.getMessage());
            throw new GameException("Error awarding points");
        }
    }

    public List<PlayerDeveloperPointsDTO> getPlayerPointsByDeveloper(Long playerId) throws GameException {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new GameException("Player not found"));

        List<PlayerDeveloperPoints> pdps = playerDeveloperPointsRepository.findByPlayer(player);
        return pdps.stream()
                .map(pdp -> new PlayerDeveloperPointsDTO(pdp.getDeveloper().getId(), pdp.getTotalPoints()))
                .collect(Collectors.toList());
    }

    public Long getPlayerPointsForDeveloper(Long playerId, Long developerId) throws GameException {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new GameException("Player not found"));
        User developer = userRepository.findById(developerId)
                .orElseThrow(() -> new GameException("Developer not found"));

        Optional<PlayerDeveloperPoints> pdp = playerDeveloperPointsRepository.findByPlayerAndDeveloper(player, developer);
        return pdp.map(PlayerDeveloperPoints::getTotalPoints).orElse(0L);
    }

    public List<PlayerDeveloperPointsDTO> getDeveloperLeaderboard(Long developerId) throws GameException {
        User developer = userRepository.findById(developerId)
                .orElseThrow(() -> new GameException("Developer not found"));

        List<PlayerDeveloperPoints> pdps = playerDeveloperPointsRepository.findByDeveloperOrderByTotalPointsDesc(
                developer, PageRequest.of(0, 10, Sort.by("totalPoints").descending()));

        return pdps.stream()
                .map(pdp -> new PlayerDeveloperPointsDTO(pdp.getPlayer().getId(), pdp.getTotalPoints()))
                .collect(Collectors.toList());
    }
}
