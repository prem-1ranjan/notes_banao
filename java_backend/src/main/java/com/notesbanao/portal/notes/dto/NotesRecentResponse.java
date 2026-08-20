package com.notesbanao.portal.notes.dto;

import java.util.List;

import com.notesbanao.portal.common.PageMeta;

/** Notes and jobs are paged separately, and the UI interleaves them. */
public record NotesRecentResponse(
        boolean ok,
        List<NoteDto> notes,
        List<NoteJobDto> jobs,
        int retentionDays,
        int maxRecordingMinutes,
        PageMeta pagination,
        PageMeta jobsPagination) {
}
