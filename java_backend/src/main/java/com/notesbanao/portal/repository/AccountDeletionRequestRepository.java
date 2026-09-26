package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.AccountDeletionRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountDeletionRequestRepository
        extends JpaRepository<AccountDeletionRequestEntity, Long> {

    Optional<AccountDeletionRequestEntity> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}