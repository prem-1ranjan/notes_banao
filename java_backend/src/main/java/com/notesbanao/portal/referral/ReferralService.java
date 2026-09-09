package com.notesbanao.portal.referral;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.ReferralEntity;
import com.notesbanao.portal.entity.UserEntity;
import com.notesbanao.portal.repository.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class ReferralService {

    private static final int REFERRAL_REWARD = 15;
    private static final long REFERRAL_VALIDITY_DAYS = 7;

    private final ReferralRepository referralRepository;
    private final UserService userService;

    private final TransactionTemplate transactionTemplate;
    private final ReentrantLock referralCreationLock = new ReentrantLock();

    public ReferralService(ReferralRepository referralRepository, UserService userService, TransactionTemplate transactionTemplate) {
        this.referralRepository = referralRepository;
        this.userService = userService;
        this.transactionTemplate = transactionTemplate;
    }

    private boolean isReferralValid(ReferralEntity referral){
        if(referral.isUsed()){
            return false;
        }
        Instant now = Instant.now();
        Duration age = Duration.between(referral.getCreatedAt(), now);
        return !age.isNegative() && age.compareTo(Duration.ofDays(REFERRAL_VALIDITY_DAYS)) <= 0;
    }
    /** * Creates a referral invitation.
     * Rules:
     * 1. Referrer must exist.
     * 2. Referrer cannot refer themselves.
     * 3. Existing users cannot be referred.
     * 4. Duplicate active referrals are not allowed.
     */

    public ReferralEntity createReferral(
            Long referrerUserId,
            String inviteeEmail) {
        referralCreationLock.lock();
        try{
            return transactionTemplate.execute(status -> {
                if(inviteeEmail == null || inviteeEmail.isBlank()){
                    throw ApiException.badRequest("Invitee email is required.");
                }
                String email = inviteeEmail.trim().toLowerCase();

//              Verify referrer exists
                UserEntity referrer = userService.findById(referrerUserId);

//              Prevent Self-referral
                if(referrer.getEmail().equalsIgnoreCase(email)){
                    throw ApiException.badRequest("You cannot refer your own email address.");
                }
//              Existing users cannot be referred
                if(userService.existsByEmail(email)){
                    throw ApiException.badRequest("This email is already registered and cannot be referred.");
                }
//              Prevent duplicate active referrals
                Optional<ReferralEntity> existingReferral = referralRepository.findFirstByInviteeEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(email);
                if(existingReferral.isPresent()){
                    Instant now = Instant.now();
                    Duration age = Duration.between(existingReferral.get().getCreatedAt(), now);
                    if(!age.isNegative() && age.compareTo(Duration.ofDays(REFERRAL_VALIDITY_DAYS)) <= 0) {
                        throw ApiException.badRequest("A referral has already been sent to this email address.");
                    }
                }

                ReferralEntity referral = new ReferralEntity();

                referral.setToken(UUID.randomUUID().toString());
                referral.setReferrerUserId(referrerUserId);
                referral.setInviteeEmail(email);
                referral.setUsed(false);
                referral.setCreatedAt(Instant.now());

                return referralRepository.save(referral);
            });
        } finally {
            referralCreationLock.unlock();
        }
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

    public String getReferrerEmail(String token){
        ReferralEntity referral = findByToken(token);
        if(referral.isUsed()){
            throw ApiException.badRequest("This referral link is already been used.");
        }
        if(!isReferralValid(referral)){
            throw ApiException.badRequest("This referral link has expired.");
        }
        UserEntity referrer = userService.findById(referral.getReferrerUserId());
        return referrer.getEmail();
    }

    /**
     * Completes a referral after the invitee successfully signs up.
     *
     * The referrer receives 15 NB points only when:
     *
     * - referral exists
     * - referral has not been used
     * - signup email matches invitee email
     * - invitee actually exists
     * - signup occurs within 7 days of referral creation
     *
     * The method is transactional so the points and referral status are committed together.
     */

    @Transactional
    public void completeReferral(String token, String signupEmail) {

        ReferralEntity referral = findByToken(token);

        // Referral already Consumed
        if (referral.isUsed()) {
            throw ApiException.badRequest("This referral link has already been used.");
        }

        String email = signupEmail == null ? "" : signupEmail.trim().toLowerCase();

        // Signup email must match invited email
        if (!referral.getInviteeEmail()
                .equalsIgnoreCase(email)) {

            throw ApiException.badRequest(
                    "This referral link was created for a different email address."
            );
        }
        /*
         * The invitee must exist at this point because completeReferral() is called after signup.
         */
        UserEntity invitee = userService.findByEmail(email);
        if(invitee == null){
            throw ApiException.badRequest("The invited account could not be found.");
        }

//        Referral must still be within 7-day validity period
        if(!isReferralValid(referral)){
            throw ApiException.badRequest("This referral has expired.");
        }

//        Verify referrer still exists
        userService.findById(referral.getReferrerUserId());

        Instant now = Instant.now();
/*
 * Atomically claim the referral.
 *
 * Only one concurrent request can change used=false
 * to used = true
 */
        int updated = referralRepository.markAsUsedIfUnused(token, now);
        if(updated != 1){
            throw ApiException.badRequest("This referral link has already been used.");
        }

        // Award exactly 15 NB points to referrer
        userService.addPoints(
                referral.getReferrerUserId(),
                REFERRAL_REWARD
        );
    }

}