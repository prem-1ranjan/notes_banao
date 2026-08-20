package com.notesbanao.portal.auth.dto;

/** accepted_terms must be true, or the request is rejected. */
public record SignupRequest(String email, String password, Boolean accepted_terms, String referral_email) {
}
