package com.gamehub.service;

import com.gamehub.dto.LeaderboardResponse;
import com.gamehub.model.PlayerDeveloperPoints;
import com.gamehub.model.User;
import com.gamehub.repository.PlayerDeveloperPointsRepository;
import com.gamehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class LeaderboardService {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlayerDeveloperPointsRepository playerDeveloperPointsRepository;

    // Bổ sung: Lấy bảng xếp hạng 10 người chơi hàng đầu cho một developer
    public List<LeaderboardResponse> getLeaderboardByDeveloper(Long developerId) {
        logger.info("Fetching leaderboard for DeveloperID={}", developerId);

        // Kiểm tra developer có tồn tại
        User developer = userRepository.findById(developerId)
                .orElseThrow(() -> {
                    logger.warn("Developer not found: {}", developerId);
                    return new RuntimeException("Developer not found");
                });

        // Lấy 10 người chơi có điểm cao nhất, sắp xếp theo totalPoints (giảm dần) và lastUpdated (gần nhất trước)
        List<PlayerDeveloperPoints> topPlayers = playerDeveloperPointsRepository.findByDeveloperOrderByTotalPointsDesc(
                developer, PageRequest.of(0, 10, Sort.by(
                        Sort.Order.desc("totalPoints"),
                        Sort.Order.desc("lastUpdated")
                )));

        // Chuyển đổi sang LeaderboardResponse và thêm rank
        return IntStream.range(0, topPlayers.size())
                .mapToObj(i -> {
                    PlayerDeveloperPoints pdp = topPlayers.get(i);
                    return new LeaderboardResponse(
                            pdp.getPlayer().getId(),
                            pdp.getPlayer().getEmail(),
                            pdp.getTotalPoints(),
                            i + 1 // Xếp hạng từ 1 đến 10
                    );
                })
                .collect(Collectors.toList());
    }
}