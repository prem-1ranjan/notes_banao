package com.notesbanao.portal.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.dto.GoogleStartResponse;
import com.notesbanao.portal.common.ApiException;

/**
 * Google sign-in is not wired up in this build: it needs a real OAuth client
 * and a real account store. The login form shows this message next to the
 * button, which is better than a button that silently does nothing.
 */
@RestController
public class GoogleController implements GoogleApi {

    @Override
    public GoogleStartResponse start() {
        throw new ApiException(HttpStatus.NOT_IMPLEMENTED,
                "Google sign-in is not available in this build. Use the email form.");
    }
}
