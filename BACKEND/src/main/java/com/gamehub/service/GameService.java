// Note: Xử lý logic tạo và quản lý game do Developer upload.
package com.gamehub.service;

import com.gamehub.dto.GameRequest;
import com.gamehub.dto.GameResponse;
import com.gamehub.exception.GameException;
import com.gamehub.model.Game;
import com.gamehub.model.User;
import com.gamehub.model.enums.GameStatus;
import com.gamehub.model.enums.UserRole;
import com.gamehub.model.enums.UserStatus;
import com.gamehub.repository.GameRepository;
import com.gamehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class GameService {

    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService; // Injected CloudinaryService

    @Autowired
    public GameService(GameRepository gameRepository, UserRepository userRepository, CloudinaryService cloudinaryService) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public GameResponse createGame(GameRequest gameRequest, String userEmail) throws GameException {
        logger.info("Game creation attempt by user: {}", userEmail);

        User developer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new GameException("User not found");
                });

        if (developer.getRole() != UserRole.DEVELOPER) {
            logger.warn("Game creation failed - user is not a DEVELOPER: {}", userEmail);
            throw new GameException("Only DEVELOPER accounts can create games");
        }

        if (developer.getStatus() != UserStatus.APPROVED) {
            logger.warn("Game creation failed - user is not approved: {}", userEmail);
            throw new GameException("Your account is not approved yet");
        }

        // Upload preview image to Cloudinary and get the URL
        String previewImageUrl = cloudinaryService.uploadFile(gameRequest.getPreviewImage());
        String apkFileUrl = gameRequest.getApkFileUrl();

        Game game = new Game(
                gameRequest.getName(),
                gameRequest.getDescription(),
                gameRequest.getRequirements(),
                previewImageUrl, // Use the URL from Cloudinary
                apkFileUrl,
                gameRequest.isSupportLeaderboard(),
                gameRequest.isSupportPoints(),
                GameStatus.PENDING,
                developer
        );

        try {
            gameRepository.save(game);
            logger.info("Game created successfully: ID={}, Name={}, Preview URL: {}", game.getId(), game.getName(), previewImageUrl);
        } catch (Exception e) {
            logger.error("Error saving game: {}", game.getName(), e);
            throw new GameException("Error saving game");
        }

        String apiKeyMessage = generateApiKeyMessage(game);

        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getRequirements(),
                game.getPreviewImageUrl(),
                game.getApkFileUrl(),
                game.isSupportLeaderboard(),
                game.isSupportPoints(),
                game.getStatus(),
                game.getDeveloper().getId(),
                apiKeyMessage
        );
    }

    // THÊM MỚI: Phương thức updateGame để cập nhật thông tin game
    public GameResponse updateGame(Long gameId, GameRequest gameRequest, String userEmail) throws GameException {
        logger.info("Game update attempt for ID: {} by user: {}", gameId, userEmail);

        User developer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new GameException("User not found");
                });

        if (developer.getRole() != UserRole.DEVELOPER) {
            logger.warn("Game update failed - user is not a DEVELOPER: {}", userEmail);
            throw new GameException("Only DEVELOPER accounts can update games");
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> {
                    logger.warn("Game not found: {}", gameId);
                    return new GameException("Game not found");
                });

        if (!game.getDeveloper().getId().equals(developer.getId())) {
            logger.warn("Game update failed - user is not the owner: {}", userEmail);
            throw new GameException("You can only update your own games");
        }

        // Update game fields
        game.setName(gameRequest.getName());
        game.setDescription(gameRequest.getDescription());
        game.setRequirements(gameRequest.getRequirements());
        game.setApkFileUrl(gameRequest.getApkFileUrl());
        game.setSupportLeaderboard(gameRequest.isSupportLeaderboard());
        game.setSupportPoints(gameRequest.isSupportPoints());

        // Update preview image if provided
        if (gameRequest.getPreviewImage() != null && !gameRequest.getPreviewImage().isEmpty()) {
            String previewImageUrl = cloudinaryService.uploadFile(gameRequest.getPreviewImage());
            game.setPreviewImageUrl(previewImageUrl);
        }

        // Reset status to PENDING for re-approval
        game.setStatus(GameStatus.PENDING);

        try {
            gameRepository.save(game);
            logger.info("Game updated successfully: ID={}, Name={}", game.getId(), game.getName());
        } catch (Exception e) {
            logger.error("Error updating game: {}", game.getName(), e);
            throw new GameException("Error updating game");
        }

        String apiKeyMessage = generateApiKeyMessage(game);

        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getRequirements(),
                game.getPreviewImageUrl(),
                game.getApkFileUrl(),
                game.isSupportLeaderboard(),
                game.isSupportPoints(),
                game.getStatus(),
                game.getDeveloper().getId(),
                apiKeyMessage
        );
    }

    //hàm xóa game
    public void deleteGame(Long gameId, String userEmail) throws GameException {
        logger.info("Game deletion attempt for ID: {} by user: {}", gameId, userEmail);

        User developer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new GameException("User not found");
                });

        if (developer.getRole() != UserRole.DEVELOPER) {
            logger.warn("Game deletion failed - user is not a DEVELOPER: {}", userEmail);
            throw new GameException("Only DEVELOPER accounts can delete games");
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> {
                    logger.warn("Game not found: {}", gameId);
                    return new GameException("Game not found");
                });

        if (!game.getDeveloper().getId().equals(developer.getId())) {
            logger.warn("Game deletion failed - user is not the owner: {}", userEmail);
            throw new GameException("You can only delete your own games");
        }

        try {
            gameRepository.delete(game);
            logger.info("Game deleted successfully: ID={}, Name={}", game.getId(), game.getName());
        } catch (Exception e) {
            logger.error("Error deleting game: {}", game.getName(), e);
            throw new GameException("Error deleting game");
        }
    }

    public List<GameResponse> getGamesByDeveloper(String userEmail) throws GameException {
        logger.info("Fetching games for developer: {}", userEmail);

        User developer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new GameException("User not found");
                });

        if (developer.getRole() != UserRole.DEVELOPER) {
            logger.warn("Game fetch failed - user is not a DEVELOPER: {}", userEmail);
            throw new GameException("Only DEVELOPER accounts can view games");
        }

        List<Game> games = gameRepository.findByDeveloperId(developer.getId());

        // Added robust mapping to prevent crashes from bad data
        return games.stream().map(game -> {
            if (game.getDeveloper() == null) {
                logger.warn("Game with ID {} has a null developer reference. Skipping.", game.getId());
                return null;
            }
            return new GameResponse(
                    game.getId(),
                    game.getName(),
                    game.getDescription(),
                    game.getRequirements(),
                    game.getPreviewImageUrl(),
                    game.getApkFileUrl(),
                    game.isSupportLeaderboard(),
                    game.isSupportPoints(),
                    game.getStatus(),
                    game.getDeveloper().getId(),
                    generateApiKeyMessage(game)
            );
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public List<GameResponse> getPublicGames() {
        logger.info("Fetching public approved games");

        List<Game> games = gameRepository.findByStatus(GameStatus.APPROVED);
        return games.stream().map(game -> new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getRequirements(),
                game.getPreviewImageUrl(),
                game.getApkFileUrl(),
                game.isSupportLeaderboard(),
                game.isSupportPoints(),
                game.getStatus(),
                game.getDeveloper().getId(),
                null
        )).collect(Collectors.toList());
    }

    public GameResponse getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new GameException("Game not found with ID: " + id));

        // Use the existing mapping logic, assuming the developer association is valid
        if (game.getDeveloper() == null) {
            throw new GameException("Game with ID " + id + " has a null developer reference.");
        }

        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getRequirements(),
                game.getPreviewImageUrl(),
                game.getApkFileUrl(),
                game.isSupportLeaderboard(),
                game.isSupportPoints(),
                game.getStatus(),
                game.getDeveloper().getId(),
                generateApiKeyMessage(game)
        );
    }

    private String generateApiKeyMessage(Game game) {
        if (game.getStatus() != GameStatus.APPROVED) {
            return "API will be provided after Admin approves the game.";
        }
        StringBuilder message = new StringBuilder();
        if (game.isSupportLeaderboard()) {
            message.append("Leaderboard API Key: [Simulated_KEY_").append(game.getId()).append("_LB]");
        }
        if (game.isSupportPoints()) {
            if (message.length() > 0) message.append(" | ");
            message.append("Points API Key: [Simulated_KEY_").append(game.getId()).append("_PT]");
        }
        return message.length() > 0 ? message.toString() : "No API Key required.";
    }
}
