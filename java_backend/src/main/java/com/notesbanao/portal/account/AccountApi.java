package com.notesbanao.portal.account;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.account.dto.DeletionStateResponse;
import com.notesbanao.portal.account.dto.DeletionSubmitRequest;
import com.notesbanao.portal.account.dto.ReferralInviteRequest;
import com.notesbanao.portal.account.dto.ReferralInviteResponse;

import jakarta.servlet.http.HttpServletRequest;

/** Referrals, and the signed-in half of account deletion. */
@RequestMapping("/api")
public interface AccountApi {

    @PostMapping("/referrals/invite")
    ReferralInviteResponse invite(@RequestBody ReferralInviteRequest request, HttpServletRequest http);

    /** Feeds the pending-deletion banner on the profile screen. */
    @GetMapping("/account/deletion-request")
    DeletionStateResponse deletionState(HttpServletRequest request);

    @PostMapping("/account/deletion-request")
    DeletionStateResponse requestDeletion(@RequestBody DeletionSubmitRequest request, HttpServletRequest http);

    @PostMapping("/account/deletion-request/revoke")
    DeletionStateResponse revokeDeletion(HttpServletRequest request);
}
