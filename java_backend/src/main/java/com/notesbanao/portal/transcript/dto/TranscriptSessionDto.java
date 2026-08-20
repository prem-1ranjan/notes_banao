package com.notesbanao.portal.transcript.dto;

/**
 * A transcript a capture app uploaded but never turned into notes.
 *
 * Note the camelCase field names, unlike the snake_case notes list. That is not
 * a mistake, it is what the front end reads.
 */
public record TranscriptSessionDto(
        String id,
        String title,
        String status,
        String mode,
        int segmentCount,
        long uploadedDurationMs,
        long totalDurationMs,
        String recoveryReason,
        String recoveryWarning,
        String recoveryAvailableAt,
        String updatedAt) {
}
