package com.notesbanao.portal.account;

import java.time.Duration;
import java.time.Instant;

import com.notesbanao.portal.entity.AccountDeletionRequestEntity;
import com.notesbanao.portal.repository.AccountDeletionRequestRepository;
import com.notesbanao.portal.repository.UserService;
import org.springframework.stereotype.Service;

import com.notesbanao.portal.account.dto.DeletionRequestDto;
import com.notesbanao.portal.account.dto.ReferralInviteResponse;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.ReferralEntity;
import com.notesbanao.portal.referral.ReferralService;
import org.springframework.transaction.annotation.Transactional;

/** Referrals and account deletion. */
@Service
public class AccountService {
    private static final Duration DELETION_GRACE =
            Duration.ofDays(7);

    private final ReferralService referralService;
    private final UserService userService;
    private final AccountDeletionRequestRepository deletionRequestRepository;

    public AccountService(
            ReferralService referralService,
            UserService userService,
            AccountDeletionRequestRepository deletionRequestRepository) {

        this.referralService = referralService;
        this.userService = userService;
        this.deletionRequestRepository = deletionRequestRepository;
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

        int reward = referralService.getReferralReward();

        return new ReferralInviteResponse(
                true,
                "Referral invite created successfully.",
                signupUrl,
                reward
        );
    }

    public DeletionRequestDto currentDeletionRequest(Long userId) {
        return deletionRequestRepository.findByUserId(userId)
                .map(request -> new DeletionRequestDto(
                        Instant.ofEpochMilli(request.getRequestedAt()).toString(),
                        Instant.ofEpochMilli(request.getEligibleAt()).toString()
                ))
                .orElse(null);
    }

    @Transactional
    public DeletionRequestDto requestDeletion(Long userId) {

        Instant now = Instant.now();
        Instant eligibleAt = now.plus(DELETION_GRACE);
//  Soft-delete the account.
        userService.softDeleteUser(userId);

//  Store the 7-day deletion window

        AccountDeletionRequestEntity entity = new AccountDeletionRequestEntity();
        entity.setUserId(userId);
        entity.setRequestedAt(now.toEpochMilli());
        entity.setEligibleAt(eligibleAt.toEpochMilli());

        deletionRequestRepository.save(entity);

        return new DeletionRequestDto(
                now.toString(),
                eligibleAt.toString()
        );
    }

    @Transactional
    public void revokeDeletion(Long userId) {
        userService.restoreUser(userId);
        deletionRequestRepository.deleteByUserId(userId);
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