// Note: Controller xử lý các request liên quan đến quà tặng (upload, hiển thị, đổi quà), thêm quantity.
// Source: Cập nhật file GiftController.java hiện có.
package com.gamehub.controller;

import com.gamehub.dto.GiftDTO;
import com.gamehub.dto.GiftTransactionDTO;
import com.gamehub.exception.GameException;
import com.gamehub.service.GiftService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gifts")
public class GiftController {

    private static final Logger logger = LoggerFactory.getLogger(GiftController.class);

    @Autowired
    private GiftService giftService;

    @PostMapping("/upload")
    public ResponseEntity<GiftDTO> uploadGift(
            @RequestParam Long developerId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String imageUrl,
            @RequestParam Long pointCost,
            @RequestParam Long quantity,
            Authentication authentication) throws GameException {
        logger.info("Upload gift request: DeveloperID={}, Name={}, Quantity={}", developerId, name, quantity);

        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("DEVELOPER"))) {
            logger.warn("Unauthorized gift upload attempt: DeveloperID={}", developerId);
            throw new GameException("Unauthorized");
        }

        GiftDTO giftDTO = giftService.uploadGift(developerId, name, description, imageUrl, pointCost, quantity);
        return new ResponseEntity<>(giftDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GiftDTO>> getAllGifts() {
        logger.info("Fetching all gifts");
        List<GiftDTO> gifts = giftService.getAllGifts();
        return new ResponseEntity<>(gifts, HttpStatus.OK);
    }

    @PostMapping("/redeem")
    public ResponseEntity<GiftTransactionDTO> redeemGift(
            @RequestParam Long playerId,
            @RequestParam Long giftId,
            Authentication authentication) throws GameException {
        logger.info("Redeem gift request: PlayerID={}, GiftID={}", playerId, giftId);

        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("PLAYER"))) {
            logger.warn("Unauthorized gift redeem attempt: PlayerID={}", playerId);
            throw new GameException("Unauthorized");
        }

        GiftTransactionDTO transactionDTO = giftService.redeemGift(playerId, giftId);
        return new ResponseEntity<>(transactionDTO, HttpStatus.OK);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<GiftTransactionDTO>> getGiftTransactions(
            @RequestParam Long playerId,
            Authentication authentication) throws GameException {
        logger.info("Fetch gift transactions request: PlayerID={}", playerId);

        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("PLAYER"))) {
            logger.warn("Unauthorized gift transactions fetch attempt: PlayerID={}", playerId);
            throw new GameException("Unauthorized");
        }

        List<GiftTransactionDTO> transactions = giftService.getGiftTransactions(playerId);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
}
