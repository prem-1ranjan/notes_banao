package com.notesbanao.portal.auth;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.LoginRequest;
import com.notesbanao.portal.auth.dto.PasswordChangeRequest;
import com.notesbanao.portal.auth.dto.SignupRequest;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.store.DemoDataStore;
import com.notesbanao.portal.repository.UserSaveRequest;
import com.notesbanao.portal.repository.UserService;

/**
 * Account rules.
 *
 * This implementation is a stand-in: no password is ever checked or stored and
 * no email is sent. Replace the body of these methods with real work and the
 * controller, the interface and the front end all stay as they are.
 */
@Service
public class AuthService {

    private static final int MINIMUM_PASSWORD_LENGTH = 8;

    private final DemoDataStore store;
    private final UserService userService;

    public AuthService(DemoDataStore store,UserService userService) {
        this.store = store;
        this.userService=userService;
    }

    /** Any email and any long-enough password are accepted in this build. */
    public UserDto signIn(LoginRequest request) {
        String email = value(request == null ? null : request.email());
        String password = request == null || request.password() == null ? "" : request.password();

        if (!email.contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        if (password.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest("Password must be at least " + MINIMUM_PASSWORD_LENGTH
                    + " characters. In this build any password of that length works.");
        }

        store.setEmail(email.toLowerCase());
        return store.user();
    }

    /**
     * The real portal emails a verification link and makes the user come back.
     * Here the account is created and signed in straight away.
     */
    public UserDto signUp(SignupRequest request) {

        if (request == null) {
            throw ApiException.badRequest("Signup request is required.");
        }

        if (!Boolean.TRUE.equals(request.accepted_terms())) {
            throw ApiException.badRequest(
                    "Please accept the Terms and Privacy Policy to create an account."
            );
        }

        String email = value(request.email()).toLowerCase();

        if (!email.contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }

        String password = request.password();

        if (password == null || password.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest(
                    "Password must be at least " + MINIMUM_PASSWORD_LENGTH + " characters."
            );
        }

        // Save user in database
        userService.saveFromRequest(
                new UserSaveRequest(email, password)
        );

        // Update current user information
        store.setEmail(email);
        store.setHasPassword(true);
        store.acceptTerms();

        return store.user();
    }

    /**
     * Nothing is stored. The only thing that changes is the has_password flag,
     * which is what the profile screen reacts to.
     */
    public String changePassword(UserDto user, PasswordChangeRequest request) {
        String newPassword = request == null || request.new_password() == null ? "" : request.new_password();
        if (newPassword.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest("New password must be at least " + MINIMUM_PASSWORD_LENGTH + " characters.");
        }
        if (user.has_password() && value(request.current_password()).isEmpty()) {
            throw ApiException.badRequest("Enter your current password.");
        }

        boolean wasSet = user.has_password();
        store.setHasPassword(true);
        return wasSet ? "Password changed." : "Password set.";
    }

    public void startPasswordReset(String email) {
        if (!value(email).contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        // Deliberately does nothing else: the caller always gets the same reply.
    }

    public void completePasswordReset(String token, String newPassword) {
        if (value(token).isEmpty()) {
            throw ApiException.badRequest("This reset link is invalid or has expired.");
        }
        if (newPassword == null || newPassword.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest("New password must be at least " + MINIMUM_PASSWORD_LENGTH + " characters.");
        }
    }

    public void acceptTerms() {
        store.acceptTerms();
    }

    private static String value(String raw) {
        return raw == null ? "" : raw.trim();
    }
}
