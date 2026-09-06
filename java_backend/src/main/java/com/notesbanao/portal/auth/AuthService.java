package com.notesbanao.portal.auth;

import com.notesbanao.portal.auth.dto.ChangePhoneRequest;
import com.notesbanao.portal.entity.UserEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.LoginRequest;
import com.notesbanao.portal.auth.dto.PasswordChangeRequest;
import com.notesbanao.portal.auth.dto.SignupRequest;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.store.DemoDataStore;
import com.notesbanao.portal.repository.UserSaveRequest;
import com.notesbanao.portal.repository.UserService;
import com.notesbanao.portal.entity.ReferralEntity;
import com.notesbanao.portal.repository.ReferralService;
import org.springframework.transaction.annotation.Transactional;


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
    private final PasswordEncoder passwordEncoder;
    private final ReferralService referralService;

    public AuthService(DemoDataStore store, UserService userService, PasswordEncoder passwordEncoder, ReferralService referralService) {
        this.store = store;
        this.userService=userService;
        this.passwordEncoder = passwordEncoder;
        this.referralService = referralService;

    }

    /** Any email and any long-enough password are accepted in this build. */
    public UserDto signIn(LoginRequest request) {
        String email = value(request == null ? null : request.email()).toLowerCase();
        String password = request == null || request.password() == null ? "" : request.password();

        if (!email.contains("@")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        if (password.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest("Password must be at least " + MINIMUM_PASSWORD_LENGTH
                    + " characters.");
        }
        // Find user in database
        UserEntity user = userService.findByEmail(email);

        if (user == null) {
            throw ApiException.badRequest("Invalid email or password.");
        }

        // Compare entered password with hashed password from database
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw ApiException.badRequest("Invalid email or password.");
        }

        store.setEmail(email.toLowerCase());
        store.setHasPassword(true);
        return store.user();
    }

    /**
     * The real portal emails a verification link and makes the user come back.
     * Here the account is created and signed in straight away.
     */

    @Transactional
    public UserDto signUp(SignupRequest request) {

        if (request == null) {
            throw ApiException.badRequest("Signup request is required.");
        }

        String email = value(request.email()).toLowerCase();
        String password = request.password();

        // Save user in database
        UserEntity newUser = userService.saveFromRequest(
                new UserSaveRequest(
                        email,
                        password,
                        request.lastName(),
                        request.firstName(),
                        request.dateOfBirth(),
                        request.phone())
        );

        // Complete referral if signup came through referral link
        String referralToken = value(request.referral_token());
        





        return toUserDto(newUser);

    }

    private UserDto toUserDto(UserEntity user) {

        return new UserDto(
                String.valueOf(user.getId()),
                user.getEmail(),
                false,
                user.getPassword() != null && !user.getPassword().isBlank(),
                user.getPhone(),
                user.isPhoneVerified(),
                "active",
                true
        );
    }

    /**
     * Nothing is stored. The only thing that changes is the has_password flag,
     * which is what the profile screen reacts to.
     */
    public String changePassword(UserDto user, PasswordChangeRequest request) {

        if (request == null) {
            throw ApiException.badRequest("Password change request is required.");
        }

        String currentPassword = value(request.current_password());
        String newPassword = value(request.new_password());

        if (newPassword.length() < MINIMUM_PASSWORD_LENGTH) {
            throw ApiException.badRequest(
                    "New password must be at least "
                            + MINIMUM_PASSWORD_LENGTH
                            + " characters."
            );
        }

        if (currentPassword.isEmpty()) {
            throw ApiException.badRequest(
                    "Enter your current password."
            );
        }

        // Get the actual user from the database
        UserEntity userEntity = userService.findByEmail(user.email());

        if (userEntity == null) {
            throw ApiException.notLoggedIn();
        }

        // Verify current password
        if (!passwordEncoder.matches(
                currentPassword,
                userEntity.getPassword())) {

            throw ApiException.badRequest(
                    "Current password is incorrect."
            );
        }

        // Prevent setting the same password again
        if (passwordEncoder.matches(
                newPassword,
                userEntity.getPassword())) {

            throw ApiException.badRequest(
                    "New password must be different from your current password."
            );
        }

        // Save the new hashed password
        userService.updatePassword(
                userEntity.getId(),
                newPassword
        );

        store.setHasPassword(true);

        return "Password changed.";
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


    public void changePhone(UserDto user, ChangePhoneRequest request) {

        if (request == null || request.phone() == null) {
            throw ApiException.badRequest("Phone number is required.");
        }

        String phone = request.phone();

        userService.updatePhone(user.email(), phone);
    }
}
