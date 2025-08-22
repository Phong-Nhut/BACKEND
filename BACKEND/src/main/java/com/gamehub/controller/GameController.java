// Note: Controller xử lý các API liên quan đến tạo và xem danh sách game của Developer.
package com.gamehub.controller;

import com.gamehub.dto.GameRequest;
import com.gamehub.dto.GameResponse;
import com.gamehub.exception.GameException;
import com.gamehub.service.GameService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games")
public class GameController {

    private static final Logger logger = LoggerFactory.getLogger(GameController.class);

    @Autowired
    private GameService gameService;

    @PostMapping("/create")
    public ResponseEntity<GameResponse> createGame(@Valid @ModelAttribute GameRequest gameRequest,
                                                   Authentication authentication) throws GameException {
        logger.info("Game creation request by user: {}", authentication.getName());
        GameResponse response = gameService.createGame(gameRequest, authentication.getName());
        return ResponseEntity.ok(response);
    }

    //Phương thức update games
    @PutMapping("/{id}")
    public ResponseEntity<GameResponse> updateGame(@PathVariable Long id,
                                                   @Valid @ModelAttribute GameRequest gameRequest,
                                                   Authentication authentication) throws GameException {
        logger.info("Game update request for ID: {} by user: {}", id, authentication.getName());
        GameResponse response = gameService.updateGame(id, gameRequest, authentication.getName());
        return ResponseEntity.ok(response);
    }

    //Phương thức delete games
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGame(@PathVariable Long id,
                                             Authentication authentication) throws GameException {
        logger.info("Game deletion request for ID: {} by user: {}", id, authentication.getName());
        gameService.deleteGame(id, authentication.getName());
        return ResponseEntity.ok("Game deleted successfully");
    }

    @GetMapping("/my-games")
    public ResponseEntity<List<GameResponse>> getMyGames(Authentication authentication) throws GameException {
        logger.info("Fetching games for user: {}", authentication.getName());
        List<GameResponse> games = gameService.getGamesByDeveloper(authentication.getName());
        return ResponseEntity.ok(games);
    }

    @GetMapping("/public")
    public ResponseEntity<List<GameResponse>> getPublicGames() {
        logger.info("Fetching public approved games");
        List<GameResponse> games = gameService.getPublicGames();
        return ResponseEntity.ok(games);
    }

    // New public endpoint to get a single game by its ID
    @GetMapping("/{id}")
    public ResponseEntity<GameResponse> getGameById(@PathVariable Long id) {
        logger.info("Fetching game by ID: {}", id);
        GameResponse game = gameService.getGameById(id);
        return ResponseEntity.ok(game);
    }
}
