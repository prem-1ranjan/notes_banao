import { publicBusinessValue } from "@/lib/business-info";

/**
 * Central config for every NotesBanao client download surface (the /downloads
 * page, hero CTAs, dashboard Apps section). Bracketed values are placeholders
 * (hidden until filled), same pattern as business-info.ts.
 */
export const downloadsInfo = {
  // Main NotesBanao extension on the Chrome Web Store (works on Chrome + Edge).
  chromeExtensionUrl: "https://chromewebstore.google.com/detail/notesbanao/obhekonhpbikkjbbdahdcbjlkkkigigc",
  // Filled once the Google Play listing is approved; until then the Android
  // button serves the APK straight from the portal.
  androidPlayUrl: "[Google Play URL]",
  // The production portal streams the APK and the Windows installer out of
  // private object storage. There is no object storage in the demo build, so
  // these are placeholders and both cards render with `demoUnavailable` set.
  androidApkPath: "[Android APK URL]",
  desktopPath: "[Windows installer URL]",
  // The desktop app's browser companion (pause/ad/end detection for browser
  // lectures) — same listing the app's Enable button opens.
  desktopSyncHelperUrl: "https://chromewebstore.google.com/detail/notesbanao-desktop-sync/gmilicnfolanhhgnldmikcnogoojdipb"
} as const;

export type ClientKey = "extension" | "desktop" | "android";

export type DownloadTarget = {
  key: ClientKey;
  name: string;
  useCase: string;
  /** Short selling points shown as a checklist on the download card. */
  features: string[];
  ctaLabel: string;
  href: string;
  /** Present when installing means leaving the portal (store listings). */
  external: boolean;
  /** The real file lives in private storage, so the demo build cannot serve it. */
  demoUnavailable?: boolean;
  /** Android only: direct-APK note shown while the Play listing is pending. */
  sideloadNote?: string;
  /** Desktop only: Chrome Web Store link for the Sync helper companion. */
  helperUrl?: string;
  /** Muted helper line under the CTA (e.g. the Windows SmartScreen heads-up). */
  note?: string;
};

const clientFeatures: Record<ClientKey, string[]> = {
  extension: [
    "One-click capture on any lecture tab",
    "Skips ads and pauses automatically",
    "Transcribes in your browser — audio never leaves your computer"
  ],
  desktop: [
    "Captures system audio from any app or player",
    "Browser lectures too — the Sync helper skips ads and pauses",
    "Transcribes on your PC — audio never leaves your computer"
  ],
  android: [
    "Record over your video and class apps",
    "Floating recorder bubble while you watch",
    "Transcribes on your phone — audio never leaves your device"
  ]
};

/** Resolved download targets — placeholder-gated, so an unset store URL never
 * renders a dead link. */
export function downloadTargets(): DownloadTarget[] {
  const extensionUrl = publicBusinessValue(downloadsInfo.chromeExtensionUrl);
  const playUrl = publicBusinessValue(downloadsInfo.androidPlayUrl);

  const targets: DownloadTarget[] = [];
  if (extensionUrl) {
    targets.push({
      key: "extension",
      name: "Chrome Extension",
      useCase: "Record lectures playing in a Chrome or Edge tab.",
      features: clientFeatures.extension,
      ctaLabel: "Add to Chrome",
      href: extensionUrl,
      external: true
    });
  }
  const desktopHref = publicBusinessValue(downloadsInfo.desktopPath);
  targets.push({
    key: "desktop",
    name: "Windows Desktop App",
    useCase: "Record online meetings, classes, or any video playing on your PC.",
    features: clientFeatures.desktop,
    ctaLabel: "Download for Windows",
    href: desktopHref || "#",
    external: false,
    demoUnavailable: !desktopHref,
    helperUrl: publicBusinessValue(downloadsInfo.desktopSyncHelperUrl) || undefined,
    note: desktopHref
      ? "Because it’s a new app, Windows may show a “Windows protected your PC” screen — click “More info → Run anyway” to install. It’s safe."
      : "The installer is served from private storage in production, so it is not part of this demo build."
  });
  targets.push(
    playUrl
      ? {
          key: "android",
          name: "Android App",
          useCase: "Record live classes and lectures on your phone.",
          features: clientFeatures.android,
          ctaLabel: "Get it on Google Play",
          href: playUrl,
          external: true
        }
      : {
          key: "android",
          name: "Android App",
          useCase: "Record live classes and lectures on your phone.",
          features: clientFeatures.android,
          ctaLabel: "Download APK",
          href: publicBusinessValue(downloadsInfo.androidApkPath) || "#",
          external: false,
          demoUnavailable: !publicBusinessValue(downloadsInfo.androidApkPath),
          note: "The APK is served from private storage in production, so it is not part of this demo build."
        }
  );
  return targets;
}

/**
 * Order the download cards for a visitor, detected platform first.
 *   Android phone        -> Android, Extension, Desktop
 *   Windows + Chromium   -> Extension (lightest install), Desktop, Android
 *   Windows + other      -> Desktop, Extension, Android
 *   Mac / everything else-> Extension, Android, Desktop (desktop is Windows-only)
 */
export function orderForUserAgent(targets: DownloadTarget[], userAgent: string): DownloadTarget[] {
  const ua = String(userAgent || "").toLowerCase();
  const isAndroid = ua.includes("android");
  const isWindows = ua.includes("windows nt");
  const isChromium = ua.includes("chrome/") || ua.includes("chromium") || ua.includes("edg/");

  const order: ClientKey[] = isAndroid
    ? ["android", "extension", "desktop"]
    : isWindows
      ? (isChromium ? ["extension", "desktop", "android"] : ["desktop", "extension", "android"])
      : ["extension", "android", "desktop"];

  return [...targets].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}
