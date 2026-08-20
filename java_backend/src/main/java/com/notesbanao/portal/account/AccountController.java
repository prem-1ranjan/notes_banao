package com.notesbanao.portal.account;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.notesbanao.portal.account.dto.DeletionRequestDto;
import com.notesbanao.portal.account.dto.DeletionStateResponse;
import com.notesbanao.portal.account.dto.DeletionSubmitRequest;
import com.notesbanao.portal.account.dto.ReferralInviteRequest;
import com.notesbanao.portal.account.dto.ReferralInviteResponse;
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
        sessionService.requireUser(request);
        DeletionRequestDto pending = accountService.currentDeletionRequest();
        return new DeletionStateResponse(true, pending != null, pending);
    }

    @Override
    public DeletionStateResponse requestDeletion(DeletionSubmitRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        DeletionRequestDto created = accountService.requestDeletion(request == null ? null : request.reason());
        return new DeletionStateResponse(true, true, created);
    }

    @Override
    public DeletionStateResponse revokeDeletion(HttpServletRequest request) {
        sessionService.requireUser(request);
        accountService.revokeDeletion();
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
