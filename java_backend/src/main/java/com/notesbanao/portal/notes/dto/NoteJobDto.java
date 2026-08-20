package com.notesbanao.portal.notes.dto;

/**
 * A notes-generation job.
 *
 * status is one of: recording and recording_paused while the device is still
 * capturing; queued, reserving_points, generating and saving while work is in
 * progress, which is when the dashboard polls; completed, when notes_id points
 * at the finished note; or failed, cancelled and expired, when error_code and
 * error_message are shown instead.
 */
public record NoteJobDto(
        String id,
        String title,
        String status,
        String error_code,
        String error_message,
        String notes_id,
        String created_at,
        String updated_at,
        int duration_seconds) {
}
