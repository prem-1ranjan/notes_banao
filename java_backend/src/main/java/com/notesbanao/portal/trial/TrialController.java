package com.notesbanao.portal.trial;

import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.trial.dto.TrialStartRequest;
import com.notesbanao.portal.trial.dto.TrialStartResponse;
import com.notesbanao.portal.trial.dto.TrialStatusResponse;
import com.notesbanao.portal.trial.dto.TrialVerifyRequest;
import com.notesbanao.portal.trial.dto.TrialVerifyResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class TrialController implements TrialApi {

    private final TrialService trialService;
    private final SessionService sessionService;

    public TrialController(TrialService trialService, SessionService sessionService) {
        this.trialService = trialService;
        this.sessionService = sessionService;
    }

    @Override
    public TrialStatusResponse status(HttpServletRequest request) {
        sessionService.requireUser(request);
        return trialService.status();
    }

    @Override
    public TrialStartResponse start(TrialStartRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        return trialService.start(request == null ? null : request.phone());
    }

    @Override
    public TrialVerifyResponse verify(TrialVerifyRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        return new TrialVerifyResponse(true, trialService.verify(request == null ? null : request.otp()));
    }
}
