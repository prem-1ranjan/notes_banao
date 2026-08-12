"use client";

import Link from "next/link";
import { businessInfo } from "@/lib/business-info";
import { downloadTargets } from "@/lib/downloads-info";
import { DownloadsGrid } from "@/app/downloads/DownloadsGrid";

/**
 * "Apps & Downloads" rendered as a dashboard section (not the standalone
 * /downloads route) so it lives inside the portal shell like Home/Notes. The
 * topbar already carries the title/subtitle, so this is just the app cards.
 *
 * A fixed target order (no user-agent reordering) keeps server and client
 * renders identical — the portal is one page, so a hydration mismatch here
 * would surface as a React warning.
 */
export function DownloadsPanel() {
  const targets = downloadTargets();
  const android = targets.find((target) => target.key === "android");
  // No QR for a target the demo build cannot actually serve.
  const androidQrUrl = android && !android.demoUnavailable ? absoluteUrl(android.href) : "";

  return (
    <div className="downloads-panel">
      <DownloadsGrid targets={targets} androidQrUrl={androidQrUrl} />
      <p className="downloads-footnote">
        Every app syncs to this account — notes from your browser, PC, and phone all land in your{" "}
        <Link href="/dashboard?section=notes">Notes</Link>.
      </p>
    </div>
  );
}

function absoluteUrl(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `https://${businessInfo.domain}${href.startsWith("/") ? href : `/${href}`}`;
}
