package com.notesbanao.portal.account;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.account.dto.PublicDeletionRequest;
import com.notesbanao.portal.account.dto.TokenRequest;
import com.notesbanao.portal.common.SimpleResponse;

/**
 * Account deletion without a session.
 *
 * This is the URL listed on the app store pages, so anyone can reach it. Like
 * the password-reset start, it must answer identically whether or not the
 * account exists.
 */
@RequestMapping("/api/public/account-deletion")
public interface PublicAccountApi {

    @PostMapping("/request")
    SimpleResponse request(@RequestBody PublicDeletionRequest request);

    @PostMapping("/verify")
    SimpleResponse verify(@RequestBody TokenRequest request);
}
