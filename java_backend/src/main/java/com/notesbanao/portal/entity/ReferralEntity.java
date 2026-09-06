package com.notesbanao.portal.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "referrals",
        indexes = {
                @Index(name = "idx_referral_token", columnList = "token"),
                @Index(name = "idx_referral_referrer", columnList = "referrer_user_id")
        }
)
public class ReferralEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique token which is placed inside the signup URL.
     *
     * Example:
     * /?auth=signup&ref=550e8400-e29b-41d4-a716-446655440000
     */
    @Column(nullable = false, unique = true)
    private String token;

    /**
     * ID of the existing user who sent the referral.
     */
    @Column(name = "referrer_user_id", nullable = false)
    private Long referrerUserId;

    /**
     * Email address to which the referral was intended.
     */
    @Column(name = "invitee_email", nullable = false)
    private String inviteeEmail;

    /**
     * false = referral is still available
     * true  = referral has already rewarded the referrer
     */
    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant usedAt;

    public ReferralEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getReferrerUserId() {
        return referrerUserId;
    }

    public void setReferrerUserId(Long referrerUserId) {
        this.referrerUserId = referrerUserId;
    }

    public String getInviteeEmail() {
        return inviteeEmail;
    }

    public void setInviteeEmail(String inviteeEmail) {
        this.inviteeEmail = inviteeEmail;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }
}