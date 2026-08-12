"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api-client";
import { NoteRowHintPopup, NoteStatusIcon, useActiveNoteHint } from "./NoteStatusHint";
import { formatDate, formatDuration } from "./format";
import { downloadMarkdownText, renderAndDownloadNotesPdf } from "./richPdfDownload";
import {
  isNotesJobFailed,
  isNotesJobInProgress,
  mergeRecentNotesListItems,
  noteJobStatusHint,
  noteReadyStatusHint,
  type NoteStatusHintView
} from "./notesJobMessages";
import type { NotesPagination, RecentNote, RecentNoteJob, RecoverableTranscriptSession } from "./types";

type NotesPanelProps = {
  notes: RecentNote[];
  jobs: RecentNoteJob[];
  recoverableTranscripts: RecoverableTranscriptSession[];
  notesError: string;
  notesLoading: boolean;
  pagination: NotesPagination;
  notesTotal: number;
  jobsTotal: number;
  /** Supported recording length; 0 when the backend has not said. */
  maxRecordingMinutes: number;
  userEmail: string;
  onDelete: (noteId: string) => Promise<boolean>;
  onDiscardRecoveredTranscript: (sessionId: string) => Promise<boolean>;
  onGenerateRecoveredTranscript: (sessionId: string) => Promise<boolean>;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
};


/** Dismissed failures, kept in the browser. */
const DISMISSED_JOBS_KEY = "nb.dismissedNoteJobs";
const MAX_DISMISSED_JOBS = 200;

function readDismissedJobIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(DISMISSED_JOBS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    // A blocked or corrupt store must not take the notes list down with it.
    return [];
  }
}

function writeDismissedJobId(jobId: string): string[] {
  const next = [...readDismissedJobIds().filter((id) => id !== jobId), jobId].slice(-MAX_DISMISSED_JOBS);
  try {
    window.localStorage.setItem(DISMISSED_JOBS_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or full quota: the row still goes for this view.
  }
  return next;
}

type NoteListRowProps = {
  title: string;
  meta: string;
  hint: NoteStatusHintView;
  hintOpen: boolean;
  onOpenHint: () => void;
  actions?: ReactNode;
};

function DownloadIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m-8 0 1 13h8l1-13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function NoteListRow({
  title,
  meta,
  hint,
  hintOpen,
  onOpenHint,
  actions
}: NoteListRowProps) {
  return (
    <div className="note-row">
      <div className="note-row-copy">
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <div className="note-row-trailing">
        <div className="note-row-status-wrap">
          <NoteRowHintPopup hint={hint} visible={hintOpen} />
          <NoteStatusIcon
            tone={hint.tone}
            shortLabel={hint.shortLabel}
            active={hintOpen}
            onOpen={onOpenHint}
          />
        </div>
        {actions}
      </div>
    </div>
  );
}

export function NotesPanel({
  notes,
  jobs,
  recoverableTranscripts,
  notesError,
  notesLoading,
  pagination,
  notesTotal,
  jobsTotal,
  maxRecordingMinutes,
  userEmail,
  onDelete,
  onDiscardRecoveredTranscript,
  onGenerateRecoveredTranscript,
  onPageChange,
  onRefresh
}: NotesPanelProps) {
  const [renderingPdfNoteId, setRenderingPdfNoteId] = useState<string | null>(null);
  const [recoveringSessionId, setRecoveringSessionId] = useState<string | null>(null);
  const [discardingSessionId, setDiscardingSessionId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const hintControl = useActiveNoteHint();
  const canGoBack = pagination.page > 1 && !notesLoading;
  const canGoNext = pagination.page < pagination.totalPages && !notesLoading;
  // Failed rows the user cleared. No server endpoint deletes a job, and these
  // age out on their own, so the dismissal lives in the browser.
  const [dismissedJobIds, setDismissedJobIds] = useState<string[]>(() => readDismissedJobIds());
  const visibleJobs = useMemo(
    () => jobs.filter((job) => !dismissedJobIds.includes(job.id)),
    [jobs, dismissedJobIds]
  );
  const listItems = useMemo(() => mergeRecentNotesListItems(notes, visibleJobs), [notes, visibleJobs]);
  const hasInProgressJobs = visibleJobs.some((job) => isNotesJobInProgress(job.status));

  function dismissJob(jobId: string) {
    const next = writeDismissedJobId(jobId);
    setDismissedJobIds(next);
    showToast("Removed from your list.");
  }

  useEffect(() => () => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }

  async function confirmDelete(note: RecentNote) {
    const confirmed = window.confirm(`Delete "${note.title}" from your recent notes?`);
    if (!confirmed) {
      return;
    }
    const deleted = await onDelete(note.id);
    if (deleted) {
      showToast("Note deleted.");
    }
  }

  async function fetchNoteMarkdown(noteId: string) {
    const response = await apiFetch(`/api/notes/${encodeURIComponent(noteId)}/download?format=md`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        typeof data.message === "string"
          ? data.message
          : "Could not download note content."
      );
    }
    return response.text();
  }

  async function downloadPdfNote(note: RecentNote) {
    if (renderingPdfNoteId) {
      return;
    }

    let markdown = "";
    setRenderingPdfNoteId(note.id);
    showToast("Generating PDF...");
    try {
      markdown = await fetchNoteMarkdown(note.id);
      await renderAndDownloadNotesPdf({
        markdown,
        title: note.title,
        userEmail,
        notesFlow: note.billing_mode === "continuous_notes" ? "combined" : "single",
        billingMode: note.billing_mode
      });
      showToast("PDF download started.");
    } catch (error) {
      if (markdown) {
        downloadMarkdownText(markdown, note.title);
        showToast("PDF rendering failed, so Markdown downloaded.");
      } else {
        showToast(error instanceof Error ? error.message : "PDF download failed.");
      }
    } finally {
      setRenderingPdfNoteId(null);
    }
  }

  async function generateRecoveredTranscript(sessionId: string) {
    if (recoveringSessionId || discardingSessionId) {
      return;
    }
    setRecoveringSessionId(sessionId);
    try {
      const ok = await onGenerateRecoveredTranscript(sessionId);
      showToast(ok ? "Notes generation started." : "Could not start notes generation.");
    } finally {
      setRecoveringSessionId(null);
    }
  }

  async function discardRecoveredTranscript(session: RecoverableTranscriptSession) {
    if (recoveringSessionId || discardingSessionId) {
      return;
    }
    const confirmed = window.confirm(`Dismiss recovery for "${session.title || "this recording"}"? You will not see this recovery option again.`);
    if (!confirmed) {
      return;
    }
    setDiscardingSessionId(session.id);
    try {
      const ok = await onDiscardRecoveredTranscript(session.id);
      showToast(ok ? "Recovery dismissed." : "Could not dismiss recovery.");
    } finally {
      setDiscardingSessionId(null);
    }
  }

  return (
    <div className="content-panel notes-panel">
      {toast ? <div className="page-toast" role="status">{toast}</div> : null}
      <div className="panel-header notes-panel-header">
        <div className="notes-title-actions">
          <h2>Recent notes</h2>
          <button className="ghost" type="button" onClick={onRefresh} disabled={notesLoading}>
            Refresh
          </button>
        </div>
        <div className="notes-header-actions">
          <div className="pagination-controls notes-pagination-controls">
            <button className="ghost" disabled={!canGoBack} type="button" onClick={() => onPageChange(pagination.page - 1)}>
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages} - {notesTotal} notes</span>
            <button className="ghost" disabled={!canGoNext} type="button" onClick={() => onPageChange(pagination.page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="notes-body">
        {notesError ? <p className="message error">{notesError}</p> : null}
        {hasInProgressJobs ? (
          <p className="notes-jobs-hint">This list updates itself while notes are being made. Hover or click a status icon for details.</p>
        ) : null}
        {recoverableTranscripts.length ? (
          <div className="recoverable-transcripts" role="region" aria-label="Transcript recovery">
            <h3>Unfinished Recording Found</h3>
            <div className="recoverable-transcript-list">
              {recoverableTranscripts.map((session) => (
                <div className="recoverable-transcript-row" key={session.id}>
                  <div>
                    <strong>{session.title || "Lecture Notes"}</strong>
                    <span>{formatDuration(Math.ceil((session.totalDurationMs || session.uploadedDurationMs || 0) / 1000))} - {session.segmentCount} transcript chunks</span>
                    <p>We saved part of this recording, but notes were not created. You can generate notes from the saved transcript, or dismiss this recovery item.</p>
                  </div>
                  <div className="recoverable-transcript-actions">
                    <button
                      className="primary"
                      disabled={recoveringSessionId === session.id || discardingSessionId === session.id}
                      type="button"
                      onClick={() => generateRecoveredTranscript(session.id)}
                    >
                      {recoveringSessionId === session.id ? "Starting..." : "Generate Notes"}
                    </button>
                    <button
                      className="ghost danger"
                      disabled={recoveringSessionId === session.id || discardingSessionId === session.id}
                      type="button"
                      onClick={() => discardRecoveredTranscript(session)}
                    >
                      {discardingSessionId === session.id ? "Dismissing..." : "Discard"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!listItems.length ? (
          <p className="empty-state">{notesLoading ? "Loading notes..." : "No recent notes."}</p>
        ) : (
          <div className="notes-results">
            <div className="notes-list">
              {listItems.map((item) => {
                if (item.kind === "job") {
                  const { job } = item;
                  const hint = noteJobStatusHint(job);
                  const qualityFailed = String(job.error_code || "").trim() === "transcript_quality_failed";
                  return (
                    <NoteListRow
                      key={item.id}
                      title={job.title || "Lecture Notes"}
                      meta={`${formatDate(job.updated_at || job.created_at)} - Duration ${formatDuration(job.duration_seconds)}${qualityFailed ? " - Notes not created" : ""}`}
                      hint={hint}
                      hintOpen={hintControl.isOpen(item.id)}
                      onOpenHint={() => hintControl.open(item.id)}
                      actions={isNotesJobFailed(job.status) ? (
                        // A working row would be back on the next refresh.
                        <div className="note-actions">
                          <button
                            aria-label={`Remove ${job.title || "failed notes"} from the list`}
                            className="icon-button danger"
                            onClick={() => dismissJob(job.id)}
                            title="Remove from list"
                            type="button"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ) : undefined}
                    />
                  );
                }

                const { note } = item;
                const readyHint = noteReadyStatusHint(note);
                // A note that ran to the cap covers only the first part of a
                // longer lecture; its own duration is enough to tell.
                const cappedHours = maxRecordingMinutes > 0 &&
                  note.duration_seconds >= maxRecordingMinutes * 60
                  ? Math.round(maxRecordingMinutes / 60)
                  : 0;
                return (
                  <NoteListRow
                    key={item.id}
                    title={note.title}
                    meta={`${formatDate(note.created_at)} - Duration ${formatDuration(note.duration_seconds)}${cappedHours ? ` - Only ${cappedHours} hours of recording is supported, so these notes cover the first ${cappedHours} hours` : ""}`}
                    hint={readyHint}
                    hintOpen={hintControl.isOpen(item.id)}
                    onOpenHint={() => hintControl.open(item.id)}
                    actions={(
                      <div className="note-actions">
                        <button
                          aria-label={`Download ${note.title} as PDF`}
                          className="icon-button"
                          disabled={Boolean(renderingPdfNoteId)}
                          onClick={() => downloadPdfNote(note)}
                          title={renderingPdfNoteId === note.id ? "Generating PDF" : "Download PDF"}
                          type="button"
                        >
                          <DownloadIcon />
                        </button>
                        <button
                          aria-label={`Delete ${note.title}`}
                          className="icon-button danger"
                          onClick={() => confirmDelete(note)}
                          title="Delete"
                          type="button"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
