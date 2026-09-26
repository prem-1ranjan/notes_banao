package com.notesbanao.portal.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "account_deletion_requests")
public class AccountDeletionRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "requested_at", nullable = false)
    private Long requestedAt;

    @Column(name = "eligible_at", nullable = false)
    private Long eligibleAt;

    public AccountDeletionRequestEntity() {
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Long requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Long getEligibleAt() {
        return eligibleAt;
    }

    public void setEligibleAt(Long eligibleAt) {
        this.eligibleAt = eligibleAt;
    }
}