package com.notesbanao.portal.account.dto;

public record ReferralInviteResponse(boolean ok, String message, String signup_url, int points_amount) {
}
