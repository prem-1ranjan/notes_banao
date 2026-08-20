package com.notesbanao.portal.account;

import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.account.dto.DeletionRequestDto;
import com.notesbanao.portal.account.dto.ReferralInviteResponse;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.store.DemoDataStore;

/** Referrals and account deletion. */
@Service
public class AccountService {

    /** How long after a request the account would actually be removed. */
    private static final Duration DELETION_GRACE = Duration.ofDays(30);

    private final DemoDataStore store;

    public AccountService(DemoDataStore store) {
        this.store = store;
    }

    /**
     * No email is sent here. The reply carries the signup link instead, which is
     * what the profile screen offers to copy.
     */
    public ReferralInviteResponse invite(UserDto user, String rawEmail, String origin) {
        String email = rawEmail == null ? "" : rawEmail.trim();
        if (!email.contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        if (email.equalsIgnoreCase(user.email())) {
            throw ApiException.badRequest("You cannot refer yourself.");
        }

        String signupUrl = origin + "/?auth=signup&ref=" + java.net.URLEncoder.encode(user.email(),
                java.nio.charset.StandardCharsets.UTF_8);
        int reward = store.referralReward() == null ? 0 : store.referralReward().points_amount();

        return new ReferralInviteResponse(true,
                "Invite prepared for " + email + ". No email is sent in this build, so share the link instead.",
                signupUrl, reward);
    }

    public DeletionRequestDto currentDeletionRequest() {
        return store.deletionRequest();
    }

    public DeletionRequestDto requestDeletion(String rawReason) {
        String reason = rawReason == null ? "" : rawReason.trim();
        if (reason.isEmpty()) {
            throw ApiException.badRequest("Tell us why you are leaving.");
        }

        Instant now = Instant.now();
        DeletionRequestDto request = new DeletionRequestDto(reason, now.toString(), now.plus(DELETION_GRACE).toString());
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
        if (rawEmail == null || !rawEmail.trim().contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
    }

    public void validateToken(String token) {
        if (token == null || token.isBlank()) {
            throw ApiException.badRequest("This confirmation link is invalid or has expired.");
        }
    }
}
