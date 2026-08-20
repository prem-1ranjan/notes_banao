package com.notesbanao.portal.transcript;

import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.common.SimpleResponse;
import com.notesbanao.portal.transcript.dto.GenerateResponse;
import com.notesbanao.portal.transcript.dto.RecoverableResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class TranscriptController implements TranscriptApi {

    private final TranscriptService transcriptService;
    private final SessionService sessionService;

    public TranscriptController(TranscriptService transcriptService, SessionService sessionService) {
        this.transcriptService = transcriptService;
        this.sessionService = sessionService;
    }

    @Override
    public RecoverableResponse recoverable(int page, int limit, HttpServletRequest request) {
        sessionService.requireUser(request);
        return transcriptService.recoverable(page, limit);
    }

    @Override
    public GenerateResponse generate(String sessionId, HttpServletRequest request) {
        sessionService.requireUser(request);
        return transcriptService.generate(sessionId);
    }

    @Override
    public SimpleResponse discard(String sessionId, HttpServletRequest request) {
        sessionService.requireUser(request);
        transcriptService.discard(sessionId);
        return SimpleResponse.success();
    }
}
