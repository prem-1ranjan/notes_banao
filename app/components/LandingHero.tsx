import { businessInfo } from "@/lib/business-info";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="hero-copy">
        <h1>Your own lectures, turned into clean notes.</h1>
        <p className="hero-lede">
          Turn classes and lectures you are entitled to record into organized study notes. Speech is
          transcribed to text on your own device — your recordings never leave it.
        </p>
        <div className="hero-proof" aria-label="NotesBanao highlights">
          <span>English &amp; Hinglish lectures</span>
          <span>On-device transcription</span>
          <span>Usage-based pricing</span>
          <span>PDF + Markdown</span>
          <span>Portal history</span>
        </div>
        <p className="hero-permission">
          You are responsible for having permission to record what you use NotesBanao on.
          It does not bypass paywalls, DRM, or platform access controls, and it never
          redistributes the original lecture.
        </p>
      </div>

      <div className="hero-aside">
        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="product-visual" aria-label="NotesBanao product preview">
      <div className="browser-bar">
        <span></span>
        <span></span>
        <span></span>
        <strong>{businessInfo.domain}</strong>
      </div>
      <div className="visual-grid">
        <div className="extension-preview">
          <p>LECTURE NOTES</p>
          <h2>NotesBanao</h2>
          <div className="recording-meter">
            <span></span>
            <strong>01:18 / 03:00:00</strong>
          </div>
          <small>Continuous recording can keep capturing until you stop it or the selected time limit ends.</small>
          <button>Generate Notes</button>
        </div>
        <div className="notes-preview">
          <span>Downloaded note</span>
          <h3>Python dictionaries</h3>
          <p>Key ideas, examples, and steps are grouped for quick revision.</p>
          <div className="note-lines">
            <i></i><i></i><i></i><i></i>
          </div>
        </div>
      </div>
    </div>
  );
}
