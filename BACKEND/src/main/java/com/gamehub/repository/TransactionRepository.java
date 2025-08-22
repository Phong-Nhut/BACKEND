// Note: Repository interface cho Transaction entity với các query methods
package com.gamehub.repository;

import com.gamehub.model.Transaction;
import com.gamehub.model.User;
import com.gamehub.model.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Tìm giao dịch theo trạng thái
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);

    // Tìm giao dịch của buyer (developer)
    Page<Transaction> findByBuyer(User buyer, Pageable pageable);

    // Tìm giao dịch của seller (designer)
    Page<Transaction> findBySeller(User seller, Pageable pageable);

    Page<Transaction> findByBuyerAndStatus(User buyer, TransactionStatus status, Pageable pageable);

    // Kiểm tra developer đã mua asset này chưa
    @Query("SELECT COUNT(t) > 0 FROM Transaction t WHERE t.buyer = :buyer AND t.asset.id = :assetId AND t.status = 'APPROVED'")
    boolean existsByBuyerAndAssetIdAndStatusApproved(@Param("buyer") User buyer, @Param("assetId") Long assetId);
}
