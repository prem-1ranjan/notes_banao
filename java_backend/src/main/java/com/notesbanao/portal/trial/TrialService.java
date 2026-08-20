package com.notesbanao.portal.trial;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.config.PortalProperties;
import com.notesbanao.portal.store.DemoDataStore;
import com.notesbanao.portal.trial.dto.TrialStartResponse;
import com.notesbanao.portal.trial.dto.TrialStatusResponse;
import com.notesbanao.portal.wallet.dto.ActivityDto;

/**
 * The one-off trial points, unlocked by verifying a mobile number.
 *
 * No message is sent anywhere in this build: the code is always the configured
 * demo OTP, and it is handed back so the screen can show it.
 */
@Service
public class TrialService {

    private final DemoDataStore store;
    private final PortalProperties properties;

    public TrialService(DemoDataStore store, PortalProperties properties) {
        this.store = store;
        this.properties = properties;
    }

    public TrialStatusResponse status() {
        UserDto user = store.user();
        return new TrialStatusResponse(true, store.trialClaimed(), store.trialPoints(), user.phone_e164(),
                user.phone_verified());
    }

    public TrialStartResponse start(String rawPhone) {
        String phone = rawPhone == null ? "" : rawPhone.trim();
        if (!phone.replaceAll("[\\s-]", "").matches("\\+?\\d{10,15}")) {
            throw ApiException.badRequest("Enter a valid mobile number.");
        }

        // Already claimed is a normal answer, not a failure: the front end reads
        // can_claim_trial and shows the message rather than an error.
        if (store.trialClaimed()) {
            return new TrialStartResponse(true, "already_claimed", false, null,
                    "Trial NB Points have already been claimed on this account.");
        }

        store.startOtp(phone, properties.getDemo().getOtp());
        return new TrialStartResponse(true, "otp_sent", true, properties.getDemo().getOtp(), null);
    }

    public int verify(String otp) {
        String pendingCode = store.pendingOtpCode();
        if (pendingCode == null) {
            throw ApiException.badRequest("Request a new code first.");
        }
        if (!pendingCode.equals(otp == null ? "" : otp.trim())) {
            throw ApiException.badRequest("That code is not correct.");
        }

        int credited = store.claimTrial(store.pendingOtpPhone());
        store.clearOtp();

        // The balance moved, so the activity list has to show why.
        if (credited > 0) {
            store.addActivity(new ActivityDto(null, "point", "grant", "grant", 0, null, null, null,
                    credited, null, null, "INR", "completed", null, null, "trial_" + store.user().id(), null,
                    null, null, null));
        }
        return credited;
    }
}
