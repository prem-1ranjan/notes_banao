"use client";

import { useEffect, useState } from "react";
import type { NoteStatusHintView, NoteVisualStatus } from "./notesJobMessages";

export const NOTE_HINT_MS = 5000;

const HINT_DISMISS_SELECTOR = ".note-status-hint, .note-row-hint-popup";

type NoteStatusIconProps = {
  tone: NoteVisualStatus;
  shortLabel: string;
  active: boolean;
  onOpen: () => void;
};

function StatusIcon({ tone }: { tone: NoteVisualStatus }) {
  if (tone === "success") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5l2.5 2.5 5.5-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }
  if (tone === "warning") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
        <path d="M12 8v5m0 3h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9l6 6m0-6-6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function NoteStatusIcon({ tone, shortLabel, active, onOpen }: NoteStatusIconProps) {
  return (
    <button
      type="button"
      className={`note-status-hint note-status-hint--${tone}${active ? " active" : ""}`}
      aria-label={shortLabel}
      aria-expanded={active}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
    >
      <StatusIcon tone={tone} />
    </button>
  );
}

type NoteRowHintPopupProps = {
  hint: NoteStatusHintView;
  visible: boolean;
};

export function NoteRowHintPopup({ hint, visible }: NoteRowHintPopupProps) {
  if (!visible) {
    return null;
  }
  return (
    <div className={`note-row-hint-popup note-row-hint-popup--${hint.tone}`} role="status">
      {hint.message}
    </div>
  );
}

export function useActiveNoteHint() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const timerId = window.setTimeout(() => setActiveId(null), NOTE_HINT_MS);

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (target.closest(HINT_DISMISS_SELECTOR)) {
        return;
      }
      setActiveId(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeId]);

  return {
    isOpen(id: string) {
      return activeId === id;
    },
    open(id: string) {
      setActiveId(id);
    }
  };
}
