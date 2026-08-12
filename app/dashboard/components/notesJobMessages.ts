import type { NotesPagination, RecentNote, RecentNoteJob } from "./types";

// "recording"/"recording_paused" are not real jobs — they come from a transcript
// session still being recorded, so a lecture has a row before it is finalised.
const RECORDING = new Set(["recording", "recording_paused"]);
const IN_PROGRESS = new Set([...RECORDING, "queued", "reserving_points", "generating", "saving"]);
const TERMINAL_FAILURE = new Set(["failed", "cancelled", "expired"]);
const HIDDEN_JOB_STATUSES = new Set(["cancelled", "completed"]);

export const GENERIC_NOTES_FAILURE_MESSAGE = "Something went wrong. Please try again.";

export type NoteVisualStatus = "success" | "warning" | "failure";

export type NoteStatusHintView = {
  tone: NoteVisualStatus;
  message: string;
  shortLabel: string;
};

function normalizeText(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function isNotesJobInProgress(status: string) {
  return IN_PROGRESS.has(normalizeText(status));
}

/** A generation that will never finish — the only kind the user can clear away. */
export function isNotesJobFailed(status: string) {
  return TERMINAL_FAILURE.has(normalizeText(status));
}

export type NotesListItem =
  | { kind: "note"; id: string; sortAt: string; note: RecentNote }
  | { kind: "job"; id: string; sortAt: string; job: RecentNoteJob };

export function shouldShowRecentNoteJob(job: RecentNoteJob, noteIds: Set<string>) {
  const status = normalizeText(job.status);
  if (HIDDEN_JOB_STATUSES.has(status)) {
    return false;
  }
  const notesId = String(job.notes_id || "").trim();
  if (notesId && noteIds.has(notesId)) {
    return false;
  }
  return true;
}

export function mergeRecentNotesListItems(notes: RecentNote[], jobs: RecentNoteJob[]): NotesListItem[] {
  const noteIds = new Set(notes.map((note) => note.id));
  const seenJobNoteIds = new Set<string>();
  const items: NotesListItem[] = [];

  for (const job of jobs) {
    if (!shouldShowRecentNoteJob(job, noteIds)) {
      continue;
    }
    const notesId = String(job.notes_id || "").trim();
    if (notesId) {
      if (seenJobNoteIds.has(notesId)) {
        continue;
      }
      seenJobNoteIds.add(notesId);
    }
    items.push({
      kind: "job",
      id: `job-${job.id}`,
      sortAt: job.updated_at || job.created_at,
      job
    });
  }

  for (const note of notes) {
    items.push({
      kind: "note",
      id: `note-${note.id}`,
      sortAt: note.created_at,
      note
    });
  }

  return items.sort((left, right) => right.sortAt.localeCompare(left.sortAt));
}

function looksLikeServiceFailure(value: string, code: string): boolean {
  if (code === "temporary_service_issue" || code === "notes_generation_unavailable") {
    return true;
  }
  const msg = normalizeText(value);
  return (
    msg.includes("all configured ai providers failed") ||
    msg.includes("no active ai provider") ||
    msg.includes("orchestrator") ||
    msg.includes("llm") ||
    msg.includes("provider failed") ||
    msg.includes("capacity is not available")
  );
}

function looksTechnical(value: string): boolean {
  const msg = normalizeText(value);
  return (
    msg.includes("http ") ||
    msg.includes("r2") ||
    msg.includes("payload r2") ||
    msg.includes("queue message") ||
    msg.includes("binding") ||
    msg.includes("llm lock") ||
    /queued notes generation failed with http/.test(msg) ||
    /^[a-f0-9-]{30,}$/.test(msg.replace(/\s/g, ""))
  );
}

function notesJobStatusLabel(status: string, errorCode = ""): string {
  if (normalizeText(errorCode) === "transcript_quality_failed") {
    return "Quality issue";
  }
  switch (normalizeText(status)) {
    case "recording":
      return "Recording";
    case "recording_paused":
      return "Paused";
    case "queued":
      return "Queued";
    case "reserving_points":
      return "Reserving points";
    case "generating":
      return "Generating";
    case "saving":
      return "Saving";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Timed out";
    default:
      return "Processing";
  }
}

function notesJobProgressMessage(status: string): string {
  switch (normalizeText(status)) {
    case "recording":
      return "This lecture is being recorded. Notes are made once the recording ends.";
    case "recording_paused":
      return "Recording is paused. It resumes when your video does.";
    case "queued":
      return "Your notes request is queued and will start shortly.";
    case "reserving_points":
      return "Checking NB Points for this lecture.";
    case "generating":
      return "Creating notes from your transcript. This usually takes a minute or two.";
    case "saving":
      return "Almost done - saving your notes to the portal.";
    default:
      return "Your notes are being created in the background.";
  }
}

function notesJobUserMessage(status: string, rawMessage = "", errorCode = ""): string {
  const jobStatus = normalizeText(status);
  const message = normalizeText(rawMessage);
  const code = normalizeText(errorCode);
  const original = String(rawMessage || "").trim();

  if (code === "admin_cancelled" || (jobStatus === "cancelled" && message.includes("admin"))) {
    return "This notes request was cancelled. You can record the lecture again from the extension.";
  }

  if (jobStatus === "cancelled") {
    return "This notes request was cancelled before it finished. Try generating notes again from the extension.";
  }

  if (code === "job_expired" || jobStatus === "expired" || message.includes("expired before completion")) {
    return "This notes request timed out before finishing. Open the extension, play the lecture, and try again.";
  }

  if (code === "transcript_quality_failed") {
    return "We could not get enough clear transcript from this recording. Play the lecture with sound on and try again.";
  }

  if (code === "notes_generation_unavailable") {
    return GENERIC_NOTES_FAILURE_MESSAGE;
  }

  // Match the precise insufficient-balance signal (backend code nb_points_required
  // / HTTP 402), NOT any message that merely contains "nb points" — that loose
  // match wrongly labelled errors like "NB Points reservation is released." as an
  // insufficient-balance problem even when the wallet had plenty of points.
  if (
    code === "nb_points_required" ||
    code === "insufficient_points" ||
    message.includes("insufficient nb points") ||
    message.includes("not enough points") ||
    message.includes("recharge")
  ) {
    return "You do not have enough NB Points for this lecture. Add points in Wallet, then generate notes again.";
  }

  if (
    message.includes("login") ||
    message.includes("authenticated") ||
    message.includes("session expired") ||
    message.includes("401") ||
    message.includes("403")
  ) {
    return "Your session expired. Sign in again from the extension and retry.";
  }

  if (message.includes("too short") || message.includes("at least 10 second")) {
    return "The recording was too short. Record at least 10 seconds of lecture audio, then try again.";
  }

  if (
    message.includes("transcript quality") ||
    message.includes("quality check failed") ||
    message.includes("quality issue") ||
    message.includes("empty/too short") ||
    message.includes("no usable transcript") ||
    (message.includes("empty") && message.includes("transcript"))
  ) {
    return "We could not get enough clear transcript from this recording. Play the lecture with sound on and try again.";
  }

  if (message.includes("payload") && (message.includes("invalid") || message.includes("missing"))) {
    return "Something went wrong while preparing your recording. Try generating notes again from the extension.";
  }

  if (looksLikeServiceFailure(message, code) || looksTechnical(original)) {
    return GENERIC_NOTES_FAILURE_MESSAGE;
  }

  if (message.includes("rate") || message.includes("capacity") || message.includes("429") || message.includes("busy")) {
    return "Notes creation is busy right now. Wait a minute and check back here, or try again from the extension.";
  }

  if (jobStatus === "failed" && !original) {
    return GENERIC_NOTES_FAILURE_MESSAGE;
  }

  return original || GENERIC_NOTES_FAILURE_MESSAGE;
}

function jobVisualStatus(status: string): NoteVisualStatus {
  const value = normalizeText(status);
  if (TERMINAL_FAILURE.has(value) && value !== "cancelled") {
    return "failure";
  }
  return "warning";
}

export function combinedNotesListPagination(
  notes: NotesPagination,
  jobs: NotesPagination
): NotesPagination {
  return {
    page: notes.page,
    pageSize: notes.pageSize,
    total: notes.total + jobs.total,
    totalPages: Math.max(notes.totalPages, jobs.totalPages)
  };
}

export function noteJobStatusHint(job: {
  status: string;
  error_message?: string;
  error_code?: string;
}): NoteStatusHintView {
  const errorCode = job.error_code || "";
  return {
    tone: jobVisualStatus(job.status),
    message: isNotesJobInProgress(job.status)
      ? notesJobProgressMessage(job.status)
      : notesJobUserMessage(job.status, job.error_message || "", errorCode),
    shortLabel: notesJobStatusLabel(job.status, errorCode)
  };
}

export const READY_NOTE_STATUS_HINT: NoteStatusHintView = {
  tone: "success",
  message: "Notes are ready. Download as Markdown or PDF using the buttons on the right.",
  shortLabel: "Ready"
};

export function noteReadyStatusHint(note: {
  preview_limited?: boolean;
  preview_limit_minutes?: number | null;
}): NoteStatusHintView {
  if (note.preview_limited) {
    const minutes = Math.max(1, Number(note.preview_limit_minutes || 10));
    return {
      tone: "warning",
      message: `Only the first ${minutes} minutes of this lecture were included in your notes. Add NB Points for the full lecture.`,
      shortLabel: "Preview"
    };
  }
  return READY_NOTE_STATUS_HINT;
}
