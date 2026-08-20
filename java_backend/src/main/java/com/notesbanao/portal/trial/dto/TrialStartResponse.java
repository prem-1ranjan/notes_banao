package com.notesbanao.portal.trial.dto;

/**
 * dev_otp is a development convenience and should be omitted in production; the
 * front end simply stops showing the code on screen.
 *
 * When the number cannot be used this is still a 200, with can_claim_trial
 * false and a message. That is a normal outcome, not an error.
 */
public record TrialStartResponse(
        boolean ok,
        String status,
        boolean can_claim_trial,
        String dev_otp,
        String message) {
}
