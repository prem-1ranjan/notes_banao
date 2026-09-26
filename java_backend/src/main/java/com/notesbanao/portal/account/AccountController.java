package com.notesbanao.portal.account;

import com.notesbanao.portal.account.dto.*;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.config.PortalProperties;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class AccountController implements AccountApi {

    private final AccountService accountService;
    private final SessionService sessionService;
    private final PortalProperties properties;

    public AccountController(AccountService accountService, SessionService sessionService,
            PortalProperties properties) {
        this.accountService = accountService;
        this.sessionService = sessionService;
        this.properties = properties;
    }

    @Override
    public ReferralInviteResponse invite(ReferralInviteRequest request, HttpServletRequest http) {
        UserDto user = sessionService.requireUser(http);
        return accountService.invite(user, request == null ? null : request.referral_email(), portalOrigin());
    }

    @Override
    public DeletionStateResponse deletionState(HttpServletRequest request) {
        UserDto user = sessionService.requireUser(request);
        DeletionRequestDto pending = accountService.currentDeletionRequest(Long.valueOf(user.id()));
        return new DeletionStateResponse(true, pending != null, pending);
    }

    @Override
    public DeletionStateResponse requestDeletion(HttpServletRequest http) {

        UserDto user = sessionService.requireUser(http);
        DeletionRequestDto created = accountService.requestDeletion(Long.valueOf(user.id()));
        return new DeletionStateResponse(true, true, created);
    }

    @Override
    public DeletionStateResponse revokeDeletion(HttpServletRequest request) {
        UserDto user = sessionService.requireUser(request);
        accountService.revokeDeletion(Long.valueOf(user.id()));
        return new DeletionStateResponse(true, false, null);
    }

    /**
     * Where the referral link should point: the front end, not this API. The
     * first configured CORS origin is the front end by definition, so it is the
     * right answer without needing a separate setting.
     */
    private String portalOrigin() {
        return properties.getCors().getAllowedOrigins().stream()
                .findFirst()
                .orElseGet(() -> ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString());
    }
}
