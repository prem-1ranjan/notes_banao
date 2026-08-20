package com.notesbanao.portal.transcript;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.notesbanao.portal.common.SimpleResponse;
import com.notesbanao.portal.transcript.dto.GenerateResponse;
import com.notesbanao.portal.transcript.dto.RecoverableResponse;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Transcripts a capture app uploaded but never turned into notes, so the
 * dashboard can offer to recover them.
 */
@RequestMapping("/api/transcripts")
public interface TranscriptApi {

    @GetMapping("/recoverable")
    RecoverableResponse recoverable(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            HttpServletRequest request);

    /**
     * Charge NB Points and generate the notes.
     *
     * On an insufficient balance answer 402 with a userMessage whose action is
     * recharge. Nothing may be charged when the call fails.
     */
    @PostMapping("/{sessionId}/generate")
    GenerateResponse generate(@PathVariable String sessionId, HttpServletRequest request);

    /** Dismiss the recovery item without generating anything. */
    @PostMapping("/{sessionId}/discard")
    SimpleResponse discard(@PathVariable String sessionId, HttpServletRequest request);
}
