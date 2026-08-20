package com.notesbanao.portal.notes.dto;

/**
 * A generated note as it appears in the list. The Markdown body is deliberately
 * not here: it is served separately by the download endpoint.
 */
public record NoteDto(
        String id,
        String title,
        String created_at,
        int duration_seconds,
        String billing_mode,
        boolean preview_limited,
        Integer preview_limit_minutes) {
}
