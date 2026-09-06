package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.ReferralEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReferralRepository extends JpaRepository<ReferralEntity, Long> {

    Optional<ReferralEntity> findByToken(String token);

    boolean existsByToken(String token);
}