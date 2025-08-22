// Note: Repository để truy vấn bảng gifts trong MySQL.
// Source: File mới.
package com.gamehub.repository;

import com.gamehub.model.Gift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiftRepository extends JpaRepository<Gift, Long> {
    List<Gift> findByDeveloperId(Long developerId);
}
