// Note: Repository để truy vấn bảng reviews trong MySQL.
package com.gamehub.repository;

import com.gamehub.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByGameId(Long gameId);
    boolean existsByPlayerIdAndGameId(Long playerId, Long gameId);
}
