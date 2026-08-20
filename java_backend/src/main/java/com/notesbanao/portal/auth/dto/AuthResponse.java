package com.notesbanao.portal.auth.dto;

/**
 * The reply to a sign-in or sign-up.
 *
 * termsRequired is set when the account has not accepted the current terms, and
 * sends the front end to the terms screen. needsEmailVerification is set when a
 * verification email was sent instead of signing the user straight in. Both are
 * left null when they do not apply.
 */
public record AuthResponse(boolean ok, UserDto user, Boolean termsRequired, Boolean needsEmailVerification) {

    public static AuthResponse signedIn(UserDto user) {
        return new AuthResponse(true, user, null, null);
    }

    public static AuthResponse termsRequired(UserDto user) {
        return new AuthResponse(true, user, true, null);
    }
}
