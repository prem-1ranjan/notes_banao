package com.notesbanao.portal.notes;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.notesbanao.portal.common.SimpleResponse;
import com.notesbanao.portal.notes.dto.NotesRecentResponse;

import jakarta.servlet.http.HttpServletRequest;

/** Generated notes and the jobs that produce them. */
@RequestMapping("/api/notes")
public interface NotesApi {

    /**
     * The notes list, carrying an ETag. When the caller sends back a matching
     * If-None-Match, answer 304 with no body: the dashboard polls this while a
     * job is running, so the cheap path is the common one.
     */
    @GetMapping("/recent")
    ResponseEntity<NotesRecentResponse> recent(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch,
            HttpServletRequest request);

    @DeleteMapping("/{noteId}")
    SimpleResponse delete(@PathVariable String noteId, HttpServletRequest request);

    /**
     * The note body as Markdown rather than JSON, with a content-disposition
     * filename. The browser turns it into a PDF itself, so nothing is rendered
     * on the server.
     */
    @GetMapping("/{noteId}/download")
    ResponseEntity<String> download(
            @PathVariable String noteId,
            @RequestParam(defaultValue = "md") String format,
            HttpServletRequest request);
}
