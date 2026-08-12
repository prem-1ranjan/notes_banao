"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ExtensionDemo, type GuideActionKey } from "./ExtensionDemo";
import styles from "./HomePanel.module.css";

const GUIDE_ACTIONS: Record<GuideActionKey, {
  title: string | ((continuousMode: boolean) => string);
  copy: string | ((continuousMode: boolean) => string);
}> = {
  english: {
    title: "English transcription",
    copy: "Keep English when your lecture or video is in English for the most accurate notes."
  },
  hinglish: {
    title: "Hinglish transcription",
    copy: "Switch to Hinglish when the audio mixes Hindi and English so notes capture both."
  },
  signin: {
    title: "Sign in",
    copy: "Sign in connects the extension to your NotesBanao account."
  },
  dashboard: {
    title: "Dashboard",
    copy: "Open the portal to view notes, NB Points, and profile settings."
  },
  logout: {
    title: "Logout",
    copy: "Sign out of the extension on this browser."
  },
  title: {
    title: "Lecture title",
    copy: "Name the lecture so the generated notes are easy to find."
  },
  options: {
    title: "Options",
    copy: "Open settings for language, continuous recording, and note length."
  },
  language: {
    title: "Notes Language",
    copy: "Choose the language for your generated notes."
  },
  continuous: {
    title: "Continuous Recording",
    copy: (continuousMode) => continuousMode
      ? "Record multiple lectures and create one combined notes file."
      : "Record one lecture at a time."
  },
  limit: {
    title: "Auto Generate Limit",
    copy: "Choose how long continuous recording can run before notes are created."
  },
  record: {
    title: (continuousMode) => continuousMode ? "Capture Series" : "Capture Lecture",
    copy: (continuousMode) => continuousMode
      ? "Start recording multiple lectures as one session."
      : "Start recording audio from the active tab."
  },
  discard: {
    title: (continuousMode) => continuousMode ? "Stop After This Lecture" : "Stop & Discard",
    copy: (continuousMode) => continuousMode
      ? "Finish the current lecture, then prepare combined notes."
      : "Stop recording and delete this capture."
  },
  generate: {
    title: "Generate Notes",
    copy: (continuousMode) => continuousMode
      ? "Stop recording and create one combined notes file from what is captured."
      : "Stop recording and create notes from what is captured."
  },
  download: {
    title: "Download notes again",
    copy: "Download the latest generated file again."
  }
};

const GETTING_STARTED_STEPS = [
  {
    icon: <PinIcon />,
    title: "Pin NotesBanao",
    copy: "Use Chrome's toolbar pin so NotesBanao is visible before class, meetings, or videos."
  },
  {
    icon: <WindowIcon />,
    title: "Open your source",
    copy: "Keep the lecture, meeting, webinar, or video tab open while you capture the session."
  },
  {
    icon: <RecordIcon />,
    title: "Generate notes",
    copy: "Click Capture Lecture, then Generate Notes when you are ready to create the file."
  }
];

const INSTRUCTION_HISTORY_LIMIT = 12;

function nextInstructionHistory(actions: GuideActionKey[], nextAction: GuideActionKey) {
  return [
    nextAction,
    ...actions.filter((action) => action !== nextAction)
  ].slice(0, INSTRUCTION_HISTORY_LIMIT);
}

export function HomePanel() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<GuideActionKey>("english");
  const [instructionHistory, setInstructionHistory] = useState<GuideActionKey[]>(["english"]);
  const [visibleInstructionCount, setVisibleInstructionCount] = useState(1);
  const [continuousMode, setContinuousMode] = useState(false);
  const instructionStackRef = useRef<HTMLDivElement>(null);
  const instructionMeasureRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stack = instructionStackRef.current;
    const measure = instructionMeasureRef.current;
    if (!demoOpen || !stack || !measure) {
      return;
    }

    let animationFrame = 0;
    const fitInstructionsToAvailableHeight = () => {
      const availableHeight = stack.clientHeight;
      const measuredCards = Array.from(measure.querySelectorAll<HTMLElement>("[data-instruction-card]"));
      const rowGap = Number.parseFloat(window.getComputedStyle(measure).rowGap || "0") || 0;
      let usedHeight = 0;
      let count = 0;

      for (const card of measuredCards) {
        const cardHeight = card.getBoundingClientRect().height;
        const nextHeight = usedHeight + (count > 0 ? rowGap : 0) + cardHeight;
        if (nextHeight > availableHeight + 1) {
          break;
        }
        usedHeight = nextHeight;
        count += 1;
      }

      setVisibleInstructionCount(Math.max(1, Math.min(count, instructionHistory.length)));
    };

    const queueFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(fitInstructionsToAvailableHeight);
    };

    queueFit();
    const resizeObserver = new ResizeObserver(queueFit);
    resizeObserver.observe(stack);
    resizeObserver.observe(measure);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [continuousMode, demoOpen, instructionHistory]);

  function guideTextFor(action: GuideActionKey) {
    const guide = GUIDE_ACTIONS[action];
    return {
      title: typeof guide.title === "function" ? guide.title(continuousMode) : guide.title,
      copy: typeof guide.copy === "function" ? guide.copy(continuousMode) : guide.copy
    };
  }

  function selectDemoAction(action: GuideActionKey) {
    setSelectedAction(action);
    setInstructionHistory((actions) => nextInstructionHistory(actions, action));
  }

  const visibleInstructionActions = instructionHistory.slice(0, visibleInstructionCount);

  return (
    <div className={`${styles.homePanel} ${demoOpen ? styles.demoOpen : ""}`}>
      <section className={styles.homeHero}>
        <div className={styles.homeHeroCopy}>
          <h2>Use NotesBanao in 3 steps</h2>
          <p>
            Pin the extension, open your lecture or meeting, and generate notes from the popup.
          </p>
        </div>
      </section>

      <section className={styles.homeSteps} aria-label="First note checklist">
        {GETTING_STARTED_STEPS.map((step, index) => (
          <article key={step.title}>
            <span className={styles.homeStepNumber}>{index + 1}</span>
            <span className={styles.homeStepIcon} aria-hidden="true">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </section>

      <section className={styles.demoPrompt}>
        <div>
          <h3>Want a guided demo?</h3>
          <p>Open a safe interactive copy of the extension and click each control to learn what happens.</p>
        </div>
        <button className="primary" type="button" onClick={() => setDemoOpen((open) => !open)}>
          {demoOpen ? "Hide demo" : "Show interactive demo"}
        </button>
      </section>

      {demoOpen ? (
        <section className={styles.demoSection} aria-label="NotesBanao extension guided demo">
          <div className={styles.demoInstructions}>
            <h3>Interactive demo</h3>
            <div className={styles.instructionStack} ref={instructionStackRef} aria-live="polite">
              {visibleInstructionActions.map((action, index) => {
                const guide = guideTextFor(action);
                const isCurrent = index === 0 && action === selectedAction;
                return (
                  <article className={`${styles.homeGuideCard} ${isCurrent ? styles.currentGuideCard : ""}`} key={action}>
                    <h4>{guide.title}</h4>
                    <p>{guide.copy}</p>
                  </article>
                );
              })}
              <div className={styles.instructionMeasure} ref={instructionMeasureRef} aria-hidden="true">
                {instructionHistory.map((action, index) => {
                  const guide = guideTextFor(action);
                  const isCurrent = index === 0 && action === selectedAction;
                  return (
                    <article className={`${styles.homeGuideCard} ${isCurrent ? styles.currentGuideCard : ""}`} data-instruction-card key={action}>
                      <h4>{guide.title}</h4>
                      <p>{guide.copy}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
          <aside className={styles.demoBox} aria-label="Interactive NotesBanao extension demo">
            <div className={styles.demoViewport}>
              <ExtensionDemo
                continuousMode={continuousMode}
                selectedAction={selectedAction}
                onContinuousModeChange={setContinuousMode}
                onSelectAction={selectDemoAction}
              />
            </div>
          </aside>
        </section>
      ) : null}
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M14.5 3.5 20.5 9.5l-2 2-1.4-1.4-3.9 3.9v3.2l-1.2 1.2-3.9-3.9-4.2 4.2-1.4-1.4 4.2-4.2-3.9-3.9L4 8h3.2l3.9-3.9L9.5 2.5l2-2 3 3Zm-5 5H6.8l6.7 6.7v-2.7l4.2-4.2-2.2-2.2-4.2 4.2H8.6l.9-1.8Z" />
    </svg>
  );
}

function WindowIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm2 4v10h12V9H6Zm0-2h12V5H6v2Zm2 5h8v2H8v-2Zm0 4h5v2H8v-2Z" />
    </svg>
  );
}

function RecordIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}
