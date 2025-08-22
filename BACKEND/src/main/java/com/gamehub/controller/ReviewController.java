// Note: Controller xử lý các request liên quan đến review (gửi, lấy danh sách).
package com.gamehub.controller;

import com.gamehub.dto.ReviewRequest;
import com.gamehub.dto.ReviewResponse;
import com.gamehub.exception.GameException;
import com.gamehub.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest reviewRequest, Authentication authentication) throws GameException {
        logger.info("Received review submission request from user: {}", authentication.getName());
        ReviewResponse response = reviewService.submitReview(reviewRequest, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long gameId) {
        logger.info("Fetching reviews for game ID: {}", gameId);
        List<ReviewResponse> reviews = reviewService.getReviewsByGameId(gameId);
        return ResponseEntity.ok(reviews);
    }
}
