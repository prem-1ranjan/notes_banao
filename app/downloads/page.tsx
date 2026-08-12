import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { businessInfo } from "@/lib/business-info";
import { downloadTargets, orderForUserAgent } from "@/lib/downloads-info";
import { getCurrentUser } from "@/lib/session";
import { LandingNav } from "@/app/components/LandingNav";
import { LandingFooter } from "@/app/components/LandingFooter";
import { DownloadsGrid } from "./DownloadsGrid";

export const metadata: Metadata = {
  title: "Download NotesBanao — Chrome Extension, Windows App, Android App",
  description:
    "Install NotesBanao where your lectures happen: the Chrome extension for browser lectures, the Windows desktop app for Teams/Zoom, or the Android app for live classes. Everything syncs to one account."
};

export default async function DownloadsPage() {
  const userAgent = (await headers()).get("user-agent") || "";
  const targets = orderForUserAgent(downloadTargets(), userAgent);
  const android = targets.find((target) => target.key === "android");
  // No QR for a target the demo build cannot actually serve.
  const androidQrUrl = android && !android.demoUnavailable ? absoluteUrl(android.href) : "";
  // Reflect logged-in state so a signed-in visitor sees Dashboard/Logout
  // instead of Sign in / Sign up. Read-only (no cookie refresh in a render).
  const user = await getCurrentUser().catch(() => null);

  return (
    // Same shell as the landing page (full-width wrapper -> sticky nav +
    // self-centering sections + footer) so the header/footer are consistent and
    // the "Apps & Downloads" nav item shows as the active page.
    <main className="landing-page">
      <LandingNav sourceQuery="" active="downloads" user={user ? { email: user.email } : null} />
      <div className="downloads-body">
      <section className="downloads-hero">
        <h1>Install NotesBanao where your lectures happen</h1>
        <p>Pick the app for your device — all sync to one account, NB Points, and dashboard.</p>
      </section>

      <DownloadsGrid targets={targets} androidQrUrl={androidQrUrl} />

      <p className="downloads-footnote">
        Already installed? Open your <Link href="/dashboard">dashboard</Link> — notes from every app land there.
      </p>
      </div>

      <LandingFooter />
    </main>
  );
}

function absoluteUrl(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `https://${businessInfo.domain}${href.startsWith("/") ? href : `/${href}`}`;
}
