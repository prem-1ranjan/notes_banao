package com.notesbanao.portal.account;

import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.account.dto.PublicDeletionRequest;
import com.notesbanao.portal.account.dto.TokenRequest;
import com.notesbanao.portal.common.SimpleResponse;

/**
 * The deletion pair that works without a session.
 *
 * Both replies are deliberately identical whether or not the account exists.
 */
@RestController
public class PublicAccountController implements PublicAccountApi {

    private final AccountService accountService;

    public PublicAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @Override
    public SimpleResponse request(PublicDeletionRequest request) {
        accountService.validatePublicRequest(request == null ? null : request.email());
        return SimpleResponse.success(
                "If an account exists for this email, a confirmation link has been sent. (This build sends no email.)");
    }

    @Override
    public SimpleResponse verify(TokenRequest request) {
        accountService.validateToken(request == null ? null : request.token());
        return SimpleResponse.success(
                "Your deletion request has been recorded. (This build does not actually delete anything.)");
    }
}
