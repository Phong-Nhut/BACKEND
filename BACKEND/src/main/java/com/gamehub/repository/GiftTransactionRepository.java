// Note: Repository để truy vấn bảng gift_transactions trong MySQL.
// Source: File mới.
package com.gamehub.repository;

import com.gamehub.model.GiftTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiftTransactionRepository extends JpaRepository<GiftTransaction, Long> {
    List<GiftTransaction> findByPlayerId(Long playerId);
}
