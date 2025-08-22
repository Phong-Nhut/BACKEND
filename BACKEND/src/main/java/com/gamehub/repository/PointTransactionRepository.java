// Note: Repository để truy vấn bảng point_transactions trong MySQL.
package com.gamehub.repository;

import com.gamehub.model.PointTransaction;
import com.gamehub.model.enums.PointActionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    boolean existsByPlayerIdAndGameIdAndActionType(Long playerId, Long gameId, PointActionType actionType);
    List<PointTransaction> findByPlayerIdOrderByCreatedAtDesc(Long playerId, Pageable pageable);
}
