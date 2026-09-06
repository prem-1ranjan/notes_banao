package com.notesbanao.portal.account;

import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.account.dto.DeletionRequestDto;
import com.notesbanao.portal.account.dto.ReferralInviteResponse;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.ReferralEntity;
import com.notesbanao.portal.repository.ReferralService;
import com.notesbanao.portal.store.DemoDataStore;

/** Referrals and account deletion. */
@Service
public class AccountService {

    /** How long after a request the account would actually be removed. */
    private static final Duration DELETION_GRACE = Duration.ofDays(30);

    private final DemoDataStore store;
    private final ReferralService referralService;

    public AccountService(
            DemoDataStore store,
            ReferralService referralService) {

        this.store = store;
        this.referralService = referralService;
    }

    /**
     * Creates a unique referral token and stores the referral in the database.
     *
     * The token, not the referrer's email, is placed in the signup URL.
     */
    public ReferralInviteResponse invite(
            UserDto user,
            String rawEmail,
            String origin) {

        String email = rawEmail == null
                ? ""
                : rawEmail.trim().toLowerCase();

        if (!email.contains("@")) {
            throw ApiException.badRequest(
                    "Enter a valid email address."
            );
        }

        if (email.equalsIgnoreCase(user.email())) {
            throw ApiException.badRequest(
                    "You cannot refer yourself."
            );
        }

        /*
         * Create and persist the referral.
         *
         * user.id() is the existing user's ID.
         * The generated token will be used in the signup URL.
         */
        ReferralEntity referral = referralService.createReferral(
                Long.valueOf(user.id()),
                email
        );

        String signupUrl = origin
                + "/?auth=signup&ref="
                + referral.getToken();

        int reward = store.referralReward() == null
                ? 0
                : store.referralReward().points_amount();

        return new ReferralInviteResponse(
                true,
                "Referral invite created successfully.",
                signupUrl,
                reward
        );
    }

    public DeletionRequestDto currentDeletionRequest() {
        return store.deletionRequest();
    }

    public DeletionRequestDto requestDeletion(String rawReason) {

        String reason = rawReason == null
                ? ""
                : rawReason.trim();

        if (reason.isEmpty()) {
            throw ApiException.badRequest(
                    "Tell us why you are leaving."
            );
        }

        Instant now = Instant.now();

        DeletionRequestDto request =
                new DeletionRequestDto(
                        reason,
                        now.toString(),
                        now.plus(DELETION_GRACE).toString()
                );

        store.setDeletionRequest(request);

        return request;
    }

    public void revokeDeletion() {
        store.setDeletionRequest(null);
    }

    /**
     * The public request, reachable without a session.
     *
     * Nothing is looked up on purpose: the caller must not be able to learn
     * whether an address has an account.
     */
    public void validatePublicRequest(String rawEmail) {

        if (rawEmail == null
                || !rawEmail.trim().contains("@")) {

            throw ApiException.badRequest(
                    "Enter a valid email address."
            );
        }
    }

    public void validateToken(String token) {

        if (token == null || token.isBlank()) {

            throw ApiException.badRequest(
                    "This confirmation link is invalid or has expired."
            );
        }
    }
}