package com.notesbanao.portal.notes;

import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.common.SimpleResponse;
import com.notesbanao.portal.notes.dto.NotesRecentResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class NotesController implements NotesApi {

    private final NotesService notesService;
    private final SessionService sessionService;

    public NotesController(NotesService notesService, SessionService sessionService) {
        this.notesService = notesService;
        this.sessionService = sessionService;
    }

    @Override
    public ResponseEntity<NotesRecentResponse> recent(int page, int limit, String ifNoneMatch,
            HttpServletRequest request) {
        sessionService.requireUser(request);

        String etag = notesService.fingerprint();
        if (etag.equals(ifNoneMatch)) {
            // Nothing has changed since the caller last asked, so send no body.
            return ResponseEntity.status(304)
                    .eTag(etag)
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .build();
        }

        return ResponseEntity.ok()
                .eTag(etag)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(notesService.recent(page, limit));
    }

    @Override
    public SimpleResponse delete(String noteId, HttpServletRequest request) {
        sessionService.requireUser(request);
        notesService.delete(noteId);
        return SimpleResponse.success();
    }

    @Override
    public ResponseEntity<String> download(String noteId, String format, HttpServletRequest request) {
        sessionService.requireUser(request);
        NotesService.Markdown note = notesService.markdown(noteId);

        return ResponseEntity.ok()
                .contentType(new MediaType("text", "markdown", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + note.filename() + ".md\"")
                .body(note.body());
    }
}
