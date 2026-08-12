"use client";

import { useState } from "react";
import styles from "./ExtensionDemo.module.css";

export type GuideActionKey = "english" | "hinglish" | "signin" | "dashboard" | "logout" | "title" | "options" | "language" | "continuous" | "limit" | "record" | "discard" | "generate" | "download";

const CONTINUOUS_TARGET_MINUTES = [40, 60, 80, 100, 120, 140, 160, 180] as const;

type ExtensionDemoProps = {
  continuousMode: boolean;
  selectedAction: GuideActionKey;
  onContinuousModeChange: (enabled: boolean) => void;
  onSelectAction: (action: GuideActionKey) => void;
};

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function ExtensionDemo({
  continuousMode,
  selectedAction,
  onContinuousModeChange,
  onSelectAction
}: ExtensionDemoProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [notesLanguage, setNotesLanguage] = useState<"english" | "hinglish">("english");
  const [signedIn, setSignedIn] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState<(typeof CONTINUOUS_TARGET_MINUTES)[number]>(60);

  function toggleOptions() {
    setOptionsOpen((open) => !open);
    onSelectAction("options");
  }

  function toggleContinuousMode() {
    onContinuousModeChange(!continuousMode);
    onSelectAction("continuous");
  }

  function chooseLanguage(language: "english" | "hinglish") {
    setNotesLanguage(language);
    onSelectAction(language);
  }

  function signInDemoAccount() {
    setSignedIn(true);
    onSelectAction("signin");
  }

  function openDashboardDemo() {
    onSelectAction("dashboard");
  }

  function logoutDemoAccount() {
    setSignedIn(false);
    onSelectAction("logout");
  }

  function updateTargetMinutes(direction: -1 | 1) {
    const currentIndex = CONTINUOUS_TARGET_MINUTES.indexOf(targetMinutes);
    const nextIndex = Math.min(
      CONTINUOUS_TARGET_MINUTES.length - 1,
      Math.max(0, currentIndex + direction)
    );
    setTargetMinutes(CONTINUOUS_TARGET_MINUTES[nextIndex]);
    onSelectAction("limit");
  }

  return (
    <div className={styles.extension} aria-label="Interactive NotesBanao extension preview">
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/icon.png" alt="" aria-hidden="true" />
          <div>
            <span>Lecture Notes</span>
            <strong>NotesBanao</strong>
          </div>
        </div>
        <div className={styles.formatToggle} aria-label="Transcription language demo">
          <button className={notesLanguage === "english" ? styles.active : ""} type="button" onClick={() => chooseLanguage("english")}>
            Eng
          </button>
          <button className={notesLanguage === "hinglish" ? styles.active : ""} type="button" onClick={() => chooseLanguage("hinglish")}>
            Hin
          </button>
        </div>
      </header>

      <div className={styles.timer} title="Session status and recorded time">
        <span className={styles.timerStatus}>
          <i />
          <span>Download completed</span>
        </span>
        <time>00:00</time>
      </div>

      <section className={styles.account}>
        <div>
          <span>Account</span>
          <strong>{signedIn ? "abc@gmail.com" : "Guest preview"}</strong>
        </div>
        <span className={styles.accountActions}>
          {signedIn ? (
            <>
              <button className={selectedAction === "dashboard" ? styles.active : ""} type="button" onClick={openDashboardDemo}>
                Dashboard
              </button>
              <button className={selectedAction === "logout" ? styles.active : ""} type="button" onClick={logoutDemoAccount}>
                Logout
              </button>
            </>
          ) : (
            <button className={selectedAction === "signin" ? styles.active : ""} type="button" onClick={signInDemoAccount}>
              Sign in
            </button>
          )}
        </span>
      </section>

      <button className={cx(styles.titleField, selectedAction === "title" && styles.active)} type="button" onClick={() => onSelectAction("title")}>
        <span>Lecture title</span>
        <strong>Getting Started</strong>
      </button>

      <button className={cx(styles.optionsSummary, selectedAction === "options" && styles.active)} type="button" aria-expanded={optionsOpen} onClick={toggleOptions}>
        <span aria-hidden="true">&gt;</span>
        <strong>Options</strong>
      </button>

      {optionsOpen ? (
        <div className={styles.optionsPanel}>
          <button className={cx(styles.continuousRow, (selectedAction === "continuous" || continuousMode) && styles.active)} type="button" onClick={toggleContinuousMode}>
            <span>
              <strong>Continuous Recording</strong>
              <small>Record multiple lectures and create one combined notes file.</small>
            </span>
            <i className={continuousMode ? styles.switchOn : ""} aria-hidden="true" />
          </button>
          <div className={cx(styles.limitRow, selectedAction === "limit" && styles.active)}>
            <button className={styles.limitCopy} type="button" onClick={() => onSelectAction("limit")}>
              <strong>Auto Generate Limit</strong>
              <small>Create combined notes up to {targetMinutes} min. Charge is shown before generation.</small>
            </button>
            <span className={styles.limitControls} aria-label="Auto generate limit">
              <button type="button" onClick={() => updateTargetMinutes(-1)} disabled={targetMinutes === 40} aria-label="Decrease auto generate limit">
                -
              </button>
              <em>{targetMinutes} min</em>
              <button type="button" onClick={() => updateTargetMinutes(1)} disabled={targetMinutes === 180} aria-label="Increase auto generate limit">
                +
              </button>
            </span>
          </div>
        </div>
      ) : null}

      <button className={cx(styles.primaryAction, selectedAction === "record" && styles.active)} type="button" onClick={() => onSelectAction("record")}>
        {`${continuousMode ? "Capture Series" : "Capture Lecture"} (${notesLanguage === "hinglish" ? "Hin" : "Eng"})`}
      </button>

      <div className={styles.actions}>
        <button className={cx(styles.danger, selectedAction === "discard" && styles.active)} type="button" onClick={() => onSelectAction("discard")}>
          {continuousMode ? "Stop After This Lecture" : "Stop & Discard"}
        </button>
        <button className={cx(styles.success, selectedAction === "generate" && styles.active)} type="button" onClick={() => onSelectAction("generate")}>
          Generate Notes
        </button>
      </div>

      <section className={styles.statusCard}>
        <div>
          <span>Status</span>
          <strong>Download completed</strong>
        </div>
        <p>Signed out.</p>
      </section>

      <button className={cx(styles.downloadAction, selectedAction === "download" && styles.active)} type="button" onClick={() => onSelectAction("download")}>
        Download PDF Again
      </button>
    </div>
  );
}
