package com.notesbanao.portal.repository;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.ReferralEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ReferralService {

    private static final int REFERRAL_REWARD = 1500;
    private final ReferralRepository referralRepository;
    private final UserService userService;

    public ReferralService(ReferralRepository referralRepository, UserService userService) {
        this.referralRepository = referralRepository;
        this.userService = userService;
    }

    public ReferralEntity createReferral(
            Long referrerUserId,
            String inviteeEmail) {

        ReferralEntity referral = new ReferralEntity();

        referral.setToken(UUID.randomUUID().toString());
        referral.setReferrerUserId(referrerUserId);
        referral.setInviteeEmail(inviteeEmail.trim().toLowerCase());
        referral.setUsed(false);
        referral.setCreatedAt(Instant.now());

        return referralRepository.save(referral);
    }

    public ReferralEntity findByToken(String token) {

        if (token == null || token.isBlank()) {
            throw ApiException.badRequest(
                    "Referral link is invalid."
            );
        }


        return referralRepository.findByToken(token.trim())
                .orElseThrow(() ->
                        ApiException.badRequest(
                                "Referral link is invalid."
                        ));
    }



    @Transactional
    public void completeReferral(String token, String signupEmail) {

        ReferralEntity referral = findByToken(token);

        // Already used referral
        if (referral.isUsed()) {
            throw ApiException.badRequest("This referral link has already been used.");
        }

        // Signup email must match invited email
        if (!referral.getInviteeEmail()
                .equalsIgnoreCase(signupEmail.trim())) {

            throw ApiException.badRequest(
                    "This referral link was created for a different email address."
            );
        }

        // Give 1500 points to referrer
        userService.addPoints(
                referral.getReferrerUserId(),
                REFERRAL_REWARD
        );

        // Mark referral as used
        referral.setUsed(true);
        referral.setUsedAt(Instant.now());

        referralRepository.save(referral);
    }

}