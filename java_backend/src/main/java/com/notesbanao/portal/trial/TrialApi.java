package com.notesbanao.portal.trial;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.trial.dto.TrialStartRequest;
import com.notesbanao.portal.trial.dto.TrialStartResponse;
import com.notesbanao.portal.trial.dto.TrialStatusResponse;
import com.notesbanao.portal.trial.dto.TrialVerifyRequest;
import com.notesbanao.portal.trial.dto.TrialVerifyResponse;

import jakarta.servlet.http.HttpServletRequest;

/** One-off trial NB Points, unlocked by verifying a mobile number. */
@RequestMapping("/api/trial")
public interface TrialApi {

    @GetMapping("/status")
    TrialStatusResponse status(HttpServletRequest request);

    @PostMapping("/start")
    TrialStartResponse start(@RequestBody TrialStartRequest request, HttpServletRequest http);

    /** On success the front end re-reads the status to refresh the profile. */
    @PostMapping("/verify")
    TrialVerifyResponse verify(@RequestBody TrialVerifyRequest request, HttpServletRequest http);
}
