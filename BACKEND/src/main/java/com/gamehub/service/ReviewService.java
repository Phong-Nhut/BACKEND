// Note: Xử lý logic gửi và lấy danh sách review của game (review tự động được duyệt).
package com.gamehub.service;

import com.gamehub.dto.ReviewRequest;
import com.gamehub.dto.ReviewResponse;
import com.gamehub.exception.GameException;
import com.gamehub.model.Game;
import com.gamehub.model.Review;
import com.gamehub.model.User;
import com.gamehub.model.enums.ReviewStatus;
import com.gamehub.model.enums.UserRole;
import com.gamehub.repository.GameRepository;
import com.gamehub.repository.ReviewRepository;
import com.gamehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PointService pointService; // Note: Inject PointService để cộng điểm khi gửi review

    public ReviewResponse submitReview(ReviewRequest reviewRequest, String userEmail) throws GameException {
        logger.info("Review submission attempt by user: {}", userEmail);

        User player = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new GameException("User not found");
                });

        if (player.getRole() != UserRole.PLAYER) {
            logger.warn("Review submission failed - user is not a PLAYER: {}", userEmail);
            throw new GameException("Only PLAYER accounts can submit reviews");
        }

        Game game = gameRepository.findById(reviewRequest.getGameId())
                .orElseThrow(() -> {
                    logger.warn("Game not found: {}", reviewRequest.getGameId());
                    return new GameException("Game not found");
                });

        if (reviewRepository.existsByPlayerIdAndGameId(player.getId(), game.getId())) {
            logger.warn("Review submission failed - user already reviewed game: {}", game.getId());
            throw new GameException("You have already reviewed this game");
        }

        Review review = new Review(
                player,
                game,
                reviewRequest.getRating(),
                reviewRequest.getComment(),
                LocalDateTime.now()
        );

        try {
            reviewRepository.save(review);
            logger.info("Review submitted successfully: ID={}, GameID={}", review.getId(), game.getId());
            // Tự động cộng 20 điểm khi gửi review
            pointService.awardPoints(player.getId(), game.getId(), "WRITE_REVIEW", 20L);
        } catch (Exception e) {
            logger.error("Error saving review: {}", e.getMessage());
            throw new GameException("Error saving review");
        }

        return new ReviewResponse(
                review.getId(),
                player.getId(),
                player.getFullName(),
                game.getId(),
                review.getRating(),
                review.getComment(),
                ReviewStatus.APPROVED,
                review.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    public List<ReviewResponse> getReviewsByGameId(Long gameId) {
        logger.info("Fetching reviews for game: {}", gameId);

        gameRepository.findById(gameId)
                .orElseThrow(() -> new GameException("Game not found with ID: " + gameId));

        List<Review> reviews = reviewRepository.findByGameId(gameId);
        return reviews.stream().map(review -> new ReviewResponse(
                review.getId(),
                review.getPlayer().getId(),
                review.getPlayer().getFullName(),
                review.getGame().getId(),
                review.getRating(),
                review.getComment(),
                ReviewStatus.APPROVED,
                review.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )).collect(Collectors.toList());
    }
}
