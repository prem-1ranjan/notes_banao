import type { RecentNote, WalletActivity } from "./types";

export function money(paise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format((paise || 0) / 100);
}

export function nbPoints(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(Number(value || 0))));
}

export function activityAmount(activity: WalletActivity) {
  if (activity.type === "payment") {
    // Signs mark real balance changes only: paid credited (+), refunded debited
    // back (-), failed/cancelled changed nothing — their amount shows UNSIGNED
    // (an empty cell just looked broken next to the other rows).
    const status = String(activity.status || "").toLowerCase();
    const sign = status === "paid" ? "+" : status === "refunded" ? "-" : "";
    return `${sign}${nbPoints(activity.total_points)}`;
  }
  const points = Number(activity.points_delta || 0);
  const sign = points > 0 ? "+" : points < 0 ? "-" : "";
  return `${sign}${nbPoints(Math.abs(points))}`;
}

export function activityTitle(activity: WalletActivity) {
  if (activity.type === "payment") {
    const labels: Record<string, string> = {
      created: "Recharge started",
      pending: "Recharge pending",
      paid: "Recharge completed",
      failed: "Recharge failed",
      cancelled: "Recharge cancelled",
      refunded: "Recharge refunded"
    };
    return labels[String(activity.status || "").toLowerCase()] || "Recharge";
  }
  const kindLabels: Record<string, string> = {
    reserve: "NB Points held",
    capture: "NB Points debited",
    release: "NB Points returned"
  };
  const kind = String(activity.kind || "").toLowerCase();
  if (kindLabels[kind]) {
    return kindLabels[kind];
  }
  return readableKind(activity.kind);
}

export function activityDescription(activity: WalletActivity, note?: RecentNote | null) {
  if (activity.type === "payment") {
    const base = nbPoints(activity.base_points);
    const bonus = Number(activity.bonus_points || 0);
    return bonus > 0 ? `${base} + ${nbPoints(bonus)} bonus` : base;
  }
  if (note && ["reserve", "capture", "release"].includes(String(activity.kind || "").toLowerCase())) {
    return `${compactTitle(note.title)} | ${formatDuration(note.duration_seconds)}`;
  }
  // Fall back to the title/duration snapshotted on the transaction so the description
  // survives even after the source notes metadata is cleaned up.
  if (activity.note_title && ["reserve", "capture", "release"].includes(String(activity.kind || "").toLowerCase())) {
    return `${compactTitle(activity.note_title)} | ${formatDuration(activity.duration_seconds || 0)}`;
  }
  const kindDescriptions: Record<string, string> = {
    reserve: "Held while notes creation is in progress",
    capture: "Used for notes creation",
    release: "Returned after notes creation did not complete"
  };
  const kind = String(activity.kind || "").toLowerCase();
  if (kindDescriptions[kind]) {
    return kindDescriptions[kind];
  }
  return `${readablePointType(activity.point_type)} NB Points`;
}

export function fullActivityDescription(activity: WalletActivity, note?: RecentNote | null) {
  if (note && ["reserve", "capture", "release"].includes(String(activity.kind || "").toLowerCase())) {
    return `${note.title} | ${formatDuration(note.duration_seconds)}`;
  }
  if (activity.note_title && ["reserve", "capture", "release"].includes(String(activity.kind || "").toLowerCase())) {
    return `${activity.note_title} | ${formatDuration(activity.duration_seconds || 0)}`;
  }
  return activityDescription(activity, note);
}

export function readableKind(kind: string) {
  return String(kind || "other").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function readablePointType(type: string) {
  const normalized = String(type || "other").toLowerCase();
  const labels: Record<string, string> = {
    recharge: "Recharge",
    signup: "Signup",
    referral: "Referral",
    grant: "Grant",
    adjustment: "Adjustment",
    refund: "Refund",
    usage: "Usage",
    other: "Other"
  };
  return labels[normalized] || readableKind(normalized);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDuration(seconds: number) {
  const totalMinutes = Math.max(0, Math.ceil((seconds || 0) / 60));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function compactTitle(value: string, maxLength = 42) {
  const title = String(value || "Lecture Notes").trim().replace(/\s+/g, " ");
  if (title.length <= maxLength) {
    return title;
  }
  return `${title.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
