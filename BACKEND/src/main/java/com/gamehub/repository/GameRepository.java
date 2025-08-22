// Note: Repository để truy vấn bảng games trong MySQL.
package com.gamehub.repository;

import com.gamehub.model.Game;
import com.gamehub.model.enums.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByStatus(GameStatus status);
    List<Game> findByDeveloperId(Long developerId);
}
