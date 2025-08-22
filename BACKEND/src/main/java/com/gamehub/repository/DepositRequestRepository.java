// Note: Repository cho DepositRequest entity
package com.gamehub.repository;

import com.gamehub.model.DepositRequest;
import com.gamehub.model.User;
import com.gamehub.model.enums.DepositStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositRequestRepository extends JpaRepository<DepositRequest, Long> {

    Page<DepositRequest> findByStatus(DepositStatus status, Pageable pageable);

    Page<DepositRequest> findByUser(User user, Pageable pageable);

    Page<DepositRequest> findByUserAndStatus(User user, DepositStatus status, Pageable pageable);

}
