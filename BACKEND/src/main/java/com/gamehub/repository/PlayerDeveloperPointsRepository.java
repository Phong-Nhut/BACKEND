package com.gamehub.repository;

import com.gamehub.model.PlayerDeveloperPoints;
import com.gamehub.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerDeveloperPointsRepository extends JpaRepository<PlayerDeveloperPoints, Long> {
    Optional<PlayerDeveloperPoints> findByPlayerAndDeveloper(User player, User developer);
    List<PlayerDeveloperPoints> findByPlayer(User player);
    List<PlayerDeveloperPoints> findByDeveloperOrderByTotalPointsDesc(User developer, Pageable pageable);
}
