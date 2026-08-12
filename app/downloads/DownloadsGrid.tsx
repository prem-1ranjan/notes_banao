"use client";

import type { ClientKey, DownloadTarget } from "@/lib/downloads-info";
import { AndroidQr } from "./AndroidQr";

/**
 * The grid of app cards, shared by the public /downloads page and the
 * in-dashboard "Apps & Downloads" section so the card markup never drifts
 * between the two surfaces. Callers own the surrounding chrome (nav/hero on the
 * public page, the dashboard shell in the portal).
 */
export function DownloadsGrid({ targets, androidQrUrl }: { targets: DownloadTarget[]; androidQrUrl: string }) {
  return (
    <section className="downloads-grid" aria-label="NotesBanao apps">
      {targets.map((target) => (
        <article className="downloads-card" key={target.key}>
          <div className="downloads-card-head">
            <span className="downloads-icon" aria-hidden="true">{clientIcon(target.key)}</span>
            <h2>{target.name}</h2>
          </div>
          <p>{target.useCase}</p>
          <ul className="downloads-features">
            {target.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {/* Bottom group is margin-top:auto, so the CTA stays on the same line
              across all cards no matter how many sublinks/notes a card has. */}
          <div className="downloads-foot">
            {target.key === "android" && androidQrUrl ? (
              <AndroidQr url={androidQrUrl} note={target.sideloadNote} />
            ) : null}
            {target.helperUrl ? (
              <a className="downloads-sublink" href={target.helperUrl} target="_blank" rel="noopener noreferrer">
                Also add the free Sync helper to Chrome
              </a>
            ) : null}
            {target.note ? <p className="downloads-note">{target.note}</p> : null}
            {target.demoUnavailable ? (
              <button className="primary downloads-cta" type="button" disabled>
                {target.ctaLabel}
              </button>
            ) : target.external ? (
              <a className="primary downloads-cta" href={target.href} target="_blank" rel="noopener noreferrer">
                {target.ctaLabel}
              </a>
            ) : (
              <a className="primary downloads-cta" href={target.href}>
                {target.ctaLabel}
              </a>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}

function clientIcon(key: ClientKey) {
  if (key === "extension") {
    // Browser window with a tab
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M3 9h18" />
        <path d="M9 4v5" />
      </svg>
    );
  }
  if (key === "desktop") {
    // Monitor with stand
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M9 20h6" />
        <path d="M12 16v4" />
      </svg>
    );
  }
  // Phone
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}
