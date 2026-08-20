package com.notesbanao.portal.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.auth.dto.AuthResponse;
import com.notesbanao.portal.auth.dto.LoginRequest;
import com.notesbanao.portal.auth.dto.MeResponse;
import com.notesbanao.portal.auth.dto.PasswordChangeRequest;
import com.notesbanao.portal.auth.dto.ResetCompleteRequest;
import com.notesbanao.portal.auth.dto.ResetStartRequest;
import com.notesbanao.portal.auth.dto.SignupRequest;
import com.notesbanao.portal.common.SimpleResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Sign-in, sign-up and account credentials.
 *
 * This interface is the contract, not the implementation. The mappings live
 * here so that any implementation is forced to expose the same URLs, and so
 * swapping the implementation cannot silently change the API.
 *
 * Authentication is a session cookie the browser sends on every request. A
 * request without a valid session must answer 401, which the front end reads as
 * "signed out" and acts on by returning the user to the login screen.
 */
@RequestMapping("/api/auth")
public interface AuthApi {

    @PostMapping("/login")
    AuthResponse login(@RequestBody LoginRequest request, HttpServletResponse response);

    @PostMapping("/signup")
    AuthResponse signup(@RequestBody SignupRequest request, HttpServletResponse response);

    @PostMapping("/logout")
    SimpleResponse logout(HttpServletResponse response);

    /** Used by server-rendered pages to choose between dashboard and login. */
    @GetMapping("/me")
    MeResponse me(HttpServletRequest request);

    @PostMapping("/password")
    SimpleResponse changePassword(@RequestBody PasswordChangeRequest request, HttpServletRequest http);

    /**
     * Must answer identically whether or not the address has an account, so it
     * cannot be used to discover which emails are registered.
     */
    @PostMapping("/password/reset/start")
    SimpleResponse startPasswordReset(@RequestBody ResetStartRequest request);

    @PostMapping("/password/reset/complete")
    SimpleResponse completePasswordReset(@RequestBody ResetCompleteRequest request);

    @PostMapping("/terms/accept")
    SimpleResponse acceptTerms(HttpServletRequest request);
}
