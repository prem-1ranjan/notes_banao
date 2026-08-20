package com.notesbanao.portal.trial.dto;

public record TrialStatusResponse(
        boolean ok,
        boolean claimed,
        int points_amount,
        String phone_e164,
        boolean phone_verified) {
}
