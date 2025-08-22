// Note: Repository cho PaymentInfo entity
package com.gamehub.repository;

import com.gamehub.model.PaymentInfo;
import com.gamehub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Long> {

    Optional<PaymentInfo> findByIsActiveTrue();

    Optional<PaymentInfo> findByUserAndIsActiveTrue(User user);

    Optional<PaymentInfo> findByUser(User user);

}
