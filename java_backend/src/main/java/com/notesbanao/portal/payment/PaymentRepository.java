package com.notesbanao.portal.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByMerchantOrderId(
            String merchantOrderId
    );

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
            UPDATE PaymentEntity p
            SET p.pointsCredited = true,
                p.status = 'COMPLETED'
            WHERE p.merchantOrderId = :merchantOrderId
              AND p.pointsCredited = false
            """)
    int markPointsCredited(
            @Param("merchantOrderId") String merchantOrderId
    );
}