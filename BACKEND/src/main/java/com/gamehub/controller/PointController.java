// Note: Controller xử lý các request liên quan đến tích điểm (tải game).
package com.gamehub.controller;

import com.gamehub.dto.GameResponse;
import com.gamehub.dto.PlayerDeveloperPointsDTO;
import com.gamehub.dto.PointTransactionResponse;
import com.gamehub.exception.GameException;
import com.gamehub.model.PointTransaction;
import com.gamehub.repository.PointTransactionRepository;
import com.gamehub.repository.UserRepository;
import com.gamehub.service.GameService;
import com.gamehub.service.PointService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/points")
public class PointController {

    private static final Logger logger = LoggerFactory.getLogger(PointController.class);

    @Autowired
    private PointService pointService;

    @Autowired
    private GameService gameService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @GetMapping("/track-download")
    public RedirectView trackDownload(@RequestParam Long playerId, @RequestParam Long gameId, Authentication authentication) throws GameException {
        logger.info("Track download request: PlayerID={}, GameID={}", playerId, gameId);

        // Kiểm tra người dùng đăng nhập
        if (authentication == null || !authentication.getName().equals(userRepository.findById(playerId).orElseThrow().getEmail())) {
            logger.warn("Unauthorized download tracking attempt: PlayerID={}", playerId);
            throw new GameException("Unauthorized");
        }

        try {
            // Thử cộng điểm, nếu đã cộng rồi thì bỏ qua. Points null để dùng default.
            pointService.awardPoints(playerId, gameId, "DOWNLOAD_GAME", null);
            logger.info("Points awarded successfully for download");
        } catch (Exception e) {
            logger.info("Points not awarded (may have been awarded before): {}", e.getMessage());
            // Không throw exception, vẫn cho phép download
        }

        String apkFileUrl = gameService.getGameById(gameId).getApkFileUrl();
        logger.info("Redirecting to APK URL: {}", apkFileUrl);

        // Tạo RedirectView với external URL
        RedirectView redirectView = new RedirectView(apkFileUrl);
        redirectView.setStatusCode(HttpStatus.FOUND); // 302 redirect
        return redirectView;
    }

    @GetMapping("/transactions/{playerId}")
    public ResponseEntity<List<PointTransactionResponse>> getPlayerTransactions(
            @PathVariable Long playerId,
            Authentication authentication) {

        logger.info("Get transactions request for PlayerID={}", playerId);

        // Kiểm tra người dùng đăng nhập
        if (authentication == null || !authentication.getName().equals(userRepository.findById(playerId).orElseThrow().getEmail())) {
            logger.warn("Unauthorized transactions access attempt: PlayerID={}", playerId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Lấy 10 giao dịch gần nhất, sắp xếp theo thời gian tạo giảm dần
            List<PointTransaction> transactions = pointTransactionRepository
                    .findByPlayerIdOrderByCreatedAtDesc(playerId, PageRequest.of(0, 10));

            List<PointTransactionResponse> response = transactions.stream()
                    .map(transaction -> new PointTransactionResponse(
                            transaction.getId(),
                            transaction.getPlayer().getId(),
                            transaction.getGame() != null ? transaction.getGame().getId() : null,
                            transaction.getActionType(),
                            transaction.getPoints(),
                            transaction.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    ))
                    .collect(Collectors.toList());

            logger.info("Retrieved {} transactions for PlayerID={}", response.size(), playerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving transactions for PlayerID={}: {}", playerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/player/{playerId}/by-developer")
    public ResponseEntity<List<PlayerDeveloperPointsDTO>> getPlayerPointsByDeveloper(
            @PathVariable Long playerId,
            Authentication authentication) {

        logger.info("Get player points by developer request for PlayerID={}", playerId);

        if (authentication == null || !authentication.getName().equals(userRepository.findById(playerId).orElseThrow().getEmail())) {
            logger.warn("Unauthorized player points by developer access attempt: PlayerID={}", playerId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<PlayerDeveloperPointsDTO> pointsBreakdown = pointService.getPlayerPointsByDeveloper(playerId);
            logger.info("Retrieved points breakdown for {} developers for PlayerID={}", pointsBreakdown.size(), playerId);
            return ResponseEntity.ok(pointsBreakdown);
        } catch (GameException e) {
            logger.error("Error retrieving player points by developer for PlayerID={}: {}", playerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Unexpected error retrieving player points by developer for PlayerID={}: {}", playerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/player/{playerId}/developer/{developerId}")
    public ResponseEntity<Long> getPlayerPointsForDeveloper(
            @PathVariable Long playerId,
            @PathVariable Long developerId,
            Authentication authentication) {

        logger.info("Get player points for developer request: PlayerID={}, DeveloperID={}", playerId, developerId);

        if (authentication == null || !authentication.getName().equals(userRepository.findById(playerId).orElseThrow().getEmail())) {
            logger.warn("Unauthorized player points for developer access attempt: PlayerID={}", playerId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long points = pointService.getPlayerPointsForDeveloper(playerId, developerId);
            logger.info("Retrieved {} points for PlayerID={} from DeveloperID={}", points, playerId, developerId);
            return ResponseEntity.ok(points);
        } catch (GameException e) {
            logger.error("Error retrieving player points for developer: PlayerID={}, DeveloperID={}, Error={}",
                    playerId, developerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Unexpected error retrieving player points for developer: PlayerID={}, DeveloperID={}, Error={}",
                    playerId, developerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/developer/{developerId}/leaderboard")
    public ResponseEntity<List<PlayerDeveloperPointsDTO>> getDeveloperLeaderboard(
            @PathVariable Long developerId,
            Authentication authentication) {

        logger.info("Get developer leaderboard request for DeveloperID={}", developerId);

        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("DEVELOPER") || auth.getAuthority().equals("ADMIN"))) {
            logger.warn("Unauthorized developer leaderboard access attempt: DeveloperID={}", developerId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<PlayerDeveloperPointsDTO> leaderboard = pointService.getDeveloperLeaderboard(developerId);
            logger.info("Retrieved leaderboard with {} players for DeveloperID={}", leaderboard.size(), developerId);
            return ResponseEntity.ok(leaderboard);
        } catch (GameException e) {
            logger.error("Error retrieving developer leaderboard for DeveloperID={}: {}", developerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Unexpected error retrieving developer leaderboard for DeveloperID={}: {}", developerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
