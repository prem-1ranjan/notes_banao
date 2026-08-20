package com.notesbanao.portal.notes;

import java.util.List;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.common.PageMeta;
import com.notesbanao.portal.common.Paging;
import com.notesbanao.portal.notes.dto.NoteDto;
import com.notesbanao.portal.notes.dto.NoteJobDto;
import com.notesbanao.portal.notes.dto.NotesRecentResponse;
import com.notesbanao.portal.store.DemoDataStore;

/** Reading and deleting generated notes. */
@Service
public class NotesService {

    private static final int MAX_PAGE_SIZE = 50;

    private final DemoDataStore store;

    public NotesService(DemoDataStore store) {
        this.store = store;
    }

    /** Changes whenever the list changes, so an unchanged list can answer 304. */
    public String fingerprint() {
        return store.notesFingerprint();
    }

    public NotesRecentResponse recent(int page, int limit) {
        int pageSize = Paging.limit(limit, 10, MAX_PAGE_SIZE);

        List<NoteDto> allNotes = store.notes();
        PageMeta notesMeta = PageMeta.of(page, pageSize, allNotes.size());

        List<NoteJobDto> allJobs = store.jobs();
        PageMeta jobsMeta = PageMeta.of(page, pageSize, allJobs.size());

        return new NotesRecentResponse(
                true,
                Paging.slice(allNotes, notesMeta),
                Paging.slice(allJobs, jobsMeta),
                store.retentionDays(),
                store.maxRecordingMinutes(),
                notesMeta,
                jobsMeta);
    }

    public void delete(String noteId) {
        if (!store.deleteNote(noteId)) {
            throw ApiException.notFound("That note no longer exists.");
        }
    }

    /** The Markdown body, which the browser renders into a PDF. */
    public Markdown markdown(String noteId) {
        String body = store.markdown(noteId);
        if (body == null) {
            throw ApiException.notFound("That note no longer exists.");
        }
        String title = store.notes().stream()
                .filter(note -> note.id().equals(noteId))
                .map(NoteDto::title)
                .findFirst()
                .orElse("notes");
        return new Markdown(title, body);
    }

    /** A note body together with the title the download should be named after. */
    public record Markdown(String title, String body) {

        /** Turns the title into something safe to use as a filename. */
        public String filename() {
            String cleaned = title.replaceAll("[^a-zA-Z0-9]+", "-").replaceAll("^-+|-+$", "");
            if (cleaned.length() > 60) {
                cleaned = cleaned.substring(0, 60);
            }
            return cleaned.isEmpty() ? "notes" : cleaned;
        }
    }
}
