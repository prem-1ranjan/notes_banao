package com.notesbanao.portal.referral;

import com.notesbanao.portal.entity.ReferralEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<ReferralEntity, Long> {

    Optional<ReferralEntity> findByToken(String token);

    boolean existsByToken(String token);
     Optional<ReferralEntity> findFirstByInviteeEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(String inviteeEmail);

     @Modifying
     @Query("""
            UPDATE ReferralEntity r
            SET r.used = true,
                r.usedAt = :usedAt
            WHERE r.token = :token
                AND r.used = false

            """)
     int markAsUsedIfUnused(
             @Param("token")
             String token,
             @Param("usedAt")
             Instant usedAt
     );
}