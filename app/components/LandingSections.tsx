const steps = [
  {
    title: "Open a lecture you may record",
    body: "Start the NotesBanao Chrome extension during your own class, or on lecture content you have permission to record."
  },
  {
    title: "Follow the lesson",
    body: "Keep watching normally. Speech is converted to text on your own device while the lecture plays."
  },
  {
    title: "Download and revise",
    body: "Get clean PDF or Markdown notes and find them later from your portal history."
  }
];

const benefits = [
  {
    title: "Runs on your device.",
    body: "Speech is transcribed to text locally. Only that transcript text is sent to NotesBanao to write your notes — the original recording never is."
  },
  {
    title: "English and Hinglish.",
    body: "Generate notes from English lectures, or from mixed Hindi-and-English (Hinglish) lectures — pick the language right in the extension."
  },
  {
    title: "Continuous recording.",
    body: "Start once and keep studying across a full session. NotesBanao creates one notes file from everything recorded until you stop it or the selected time limit ends."
  },
  {
    title: "You choose what to record.",
    body: "NotesBanao is for lectures you own or have permission to record. It does not unlock, bypass, or work around paywalls, DRM, or platform access controls, and it never republishes the source lecture."
  },
  {
    title: "Designed for revision.",
    body: "Notes are structured so you can scan, search, and revisit important points quickly."
  },
  {
    title: "Portal keeps it tidy.",
    body: "NB Points, recent notes, account access, and downloads stay in one place."
  }
];

export function LandingSections() {
  return (
    <>
      <section className="landing-band">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Study notes in three calm steps.</h2>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article key={step.title}>
              <div className="step-card-title">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-band split-band">
        <div>
          <p className="eyebrow">Why students use it</p>
          <h2>Stay focused from video to final notes.</h2>
        </div>
        <div className="benefit-list">
          {benefits.map((benefit) => (
            <p key={benefit.title}><strong>{benefit.title}</strong> {benefit.body}</p>
          ))}
        </div>
      </section>
    </>
  );
}
