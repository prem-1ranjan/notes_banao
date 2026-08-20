package com.notesbanao.portal.account.dto;

/** turnstileToken is present when a captcha is configured on the public form. */
public record PublicDeletionRequest(String email, String reason, String turnstileToken) {
}
