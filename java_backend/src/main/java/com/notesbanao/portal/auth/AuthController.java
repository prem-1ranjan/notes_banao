package com.notesbanao.portal.auth;

import com.notesbanao.portal.entity.UserEntity;
import com.notesbanao.portal.repository.UserService;
import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.dto.AuthResponse;
import com.notesbanao.portal.auth.dto.LoginRequest;
import com.notesbanao.portal.auth.dto.MeResponse;
import com.notesbanao.portal.auth.dto.PasswordChangeRequest;
import com.notesbanao.portal.auth.dto.ResetCompleteRequest;
import com.notesbanao.portal.auth.dto.ResetStartRequest;
import com.notesbanao.portal.auth.dto.SignupRequest;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.SimpleResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Wires the auth endpoints to the service. The URL mappings are inherited from
 * AuthApi, so this class stays free of routing detail.
 */
@RestController
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final SessionService sessionService;
    private final UserService userService;

    public AuthController(AuthService authService, SessionService sessionService, UserService userService) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @Override
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        UserDto user = authService.signIn(request);
        sessionService.startSession(response, user.email());
        return user.terms_accepted_current() ? AuthResponse.signedIn(user) : AuthResponse.termsRequired(user);
    }

    @Override
    public AuthResponse signup(SignupRequest request, HttpServletResponse response) {
        UserDto user = authService.signUp(request);
        sessionService.startSession(response, user.email());
        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(request.email());
        userEntity.setPassword(request.password());
        userService.save(userEntity);
        return new AuthResponse(true, user, null, false);
    }

    @Override
    public SimpleResponse logout(HttpServletResponse response) {
        sessionService.endSession(response);
        return SimpleResponse.success();
    }

    @Override
    public MeResponse me(HttpServletRequest request) {
        return new MeResponse(true, sessionService.requireUser(request));
    }

    @Override
    public SimpleResponse changePassword(PasswordChangeRequest request, HttpServletRequest http) {
        UserDto user = sessionService.requireUser(http);
        return SimpleResponse.success(authService.changePassword(user, request));
    }

    @Override
    public SimpleResponse startPasswordReset(ResetStartRequest request) {
        authService.startPasswordReset(request == null ? null : request.email());
        return SimpleResponse.success("If an account exists for this email, a password reset link has been sent."
                + " (This build sends no email.)");
    }

    @Override
    public SimpleResponse completePasswordReset(ResetCompleteRequest request) {
        authService.completePasswordReset(
                request == null ? null : request.token(),
                request == null ? null : request.new_password());
        return SimpleResponse.success("Password updated. You can sign in now.");
    }

    @Override
    public SimpleResponse acceptTerms(HttpServletRequest request) {
        sessionService.requireUser(request);
        authService.acceptTerms();
        return SimpleResponse.success();
    }
}
