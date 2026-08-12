/**
 * Every SQL query the portal runs, in one place.
 *
 * The `/api/*` route handlers call these helpers instead of talking to a
 * backend service. Each one is a small, readable statement against the SQLite
 * schema in `lib/db.ts` — a good place to start if you want to see how a screen
 * gets its data, or to add a field of your own.
 */

import { db } from "@/demo-backend/db";

/** The mobile-verification code this build always "sends". */
export const DEMO_OTP = "123456";

/** How long after a deletion request the account would actually be removed. */
const DELETION_GRACE_DAYS = 30;

export type UserRow = {
  id: string;
  email: string;
  email_verified: number;
  has_password: number;
  phone_e164: string | null;
  phone_verified: number;
  status: string;
  terms_accepted_current: number;
  balance_points: number;
  reserved_points: number;
  trial_points: number;
  trial_claimed: number;
};

export type PortalUser = {
  id: string;
  email: string;
  email_verified: boolean;
  has_password: boolean;
  phone_e164: string | null;
  phone_verified: boolean;
  status: string;
  terms_accepted_current: boolean;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/* ---------------------------------------------------------------- user --- */

/** The single demo account. There is only ever one row in `users`. */
export function userRow(): UserRow {
  const row = db().prepare("SELECT * FROM users LIMIT 1").get() as UserRow | undefined;
  if (!row) {
    throw new Error("The demo database has no user. Run `npm run db:reset` to seed it.");
  }
  return row;
}

export function portalUser(): PortalUser {
  const row = userRow();
  return {
    id: row.id,
    email: row.email,
    email_verified: Boolean(row.email_verified),
    has_password: Boolean(row.has_password),
    phone_e164: row.phone_e164,
    phone_verified: Boolean(row.phone_verified),
    status: row.status,
    terms_accepted_current: Boolean(row.terms_accepted_current)
  };
}

export function setUserEmail(email: string) {
  db().prepare("UPDATE users SET email = ?").run(email);
}

export function setHasPassword(hasPassword: boolean) {
  db().prepare("UPDATE users SET has_password = ?").run(hasPassword ? 1 : 0);
}

export function acceptTerms() {
  db().prepare("UPDATE users SET terms_accepted_current = 1").run();
}

/* -------------------------------------------------------------- wallet --- */

export function walletSummary() {
  const row = userRow();
  return {
    user_id: row.id,
    balance_points: row.balance_points,
    reserved_points: row.reserved_points
  };
}

export function listActivities(page: number, pageSize: number) {
  const database = db();
  const user = userRow();
  const { total } = database
    .prepare("SELECT COUNT(*) AS total FROM wallet_activities WHERE user_id = ?")
    .get(user.id) as { total: number };
  const pagination = paginationFor(page, pageSize, total);
  const items = database
    .prepare(`
      SELECT id, type, kind, point_type, amount_paise, base_points, bonus_points,
             total_points, points_delta, balance_after_points, reserved_after_points,
             currency, status, provider, provider_order_id, source_id, reference_id,
             note_title, duration_seconds, created_at
      FROM wallet_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(user.id, pagination.pageSize, (pagination.page - 1) * pagination.pageSize);
  return { items, pagination };
}

type NewActivity = {
  type: "payment" | "point";
  kind: string;
  point_type: string;
  amount_paise?: number;
  base_points?: number | null;
  bonus_points?: number | null;
  total_points?: number | null;
  points_delta?: number | null;
  currency?: string;
  status: string;
  provider?: string | null;
  provider_order_id?: string | null;
  source_id: string;
  reference_id?: string | null;
  note_title?: string | null;
  duration_seconds?: number | null;
};

/** Record a movement. Call this AFTER the balance has been updated. */
export function addActivity(activity: NewActivity) {
  const user = userRow();
  const id = `act_${randomId()}`;
  db().prepare(`
    INSERT INTO wallet_activities (
      id, user_id, type, kind, point_type, amount_paise, base_points, bonus_points,
      total_points, points_delta, balance_after_points, reserved_after_points,
      currency, status, provider, provider_order_id, source_id, reference_id,
      note_title, duration_seconds, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    user.id,
    activity.type,
    activity.kind,
    activity.point_type,
    activity.amount_paise ?? 0,
    activity.base_points ?? null,
    activity.bonus_points ?? null,
    activity.total_points ?? null,
    activity.points_delta ?? null,
    user.balance_points,
    user.reserved_points,
    activity.currency ?? "INR",
    activity.status,
    activity.provider ?? null,
    activity.provider_order_id ?? null,
    activity.source_id,
    activity.reference_id ?? null,
    activity.note_title ?? null,
    activity.duration_seconds ?? null,
    new Date().toISOString()
  );
  return id;
}

export function creditPoints(points: number) {
  db().prepare("UPDATE users SET balance_points = balance_points + ?").run(points);
}

export function debitPoints(points: number) {
  db().prepare("UPDATE users SET balance_points = MAX(0, balance_points - ?)").run(points);
}

/* --------------------------------------------------------------- notes --- */

export function listNotes(page: number, pageSize: number) {
  const database = db();
  const user = userRow();
  const { total } = database
    .prepare("SELECT COUNT(*) AS total FROM notes WHERE user_id = ?")
    .get(user.id) as { total: number };
  const pagination = paginationFor(page, pageSize, total);
  const rows = database
    .prepare(`
      SELECT id, title, created_at, duration_seconds, billing_mode,
             preview_limited, preview_limit_minutes
      FROM notes
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(user.id, pagination.pageSize, (pagination.page - 1) * pagination.pageSize) as Record<string, unknown>[];

  const items = rows.map((row) => ({
    ...row,
    preview_limited: Boolean(row.preview_limited)
  }));
  return { items, pagination };
}

export function noteMarkdown(noteId: string) {
  const row = db()
    .prepare("SELECT title, markdown FROM notes WHERE id = ? AND user_id = ?")
    .get(noteId, userRow().id) as { title: string; markdown: string } | undefined;
  return row || null;
}

export function deleteNote(noteId: string) {
  const result = db().prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(noteId, userRow().id);
  return Number(result.changes) > 0;
}

export function listJobs(page: number, pageSize: number) {
  const database = db();
  const user = userRow();
  const { total } = database
    .prepare("SELECT COUNT(*) AS total FROM note_jobs WHERE user_id = ?")
    .get(user.id) as { total: number };
  const pagination = paginationFor(page, pageSize, total);
  const items = database
    .prepare(`
      SELECT id, title, status, error_code, error_message, notes_id,
             created_at, updated_at, duration_seconds
      FROM note_jobs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(user.id, pagination.pageSize, (pagination.page - 1) * pagination.pageSize);
  return { items, pagination };
}

/** Store a freshly generated note and return its id. */
export function createNote(input: { title: string; durationSeconds: number; markdown: string }) {
  const id = `note_${randomId()}`;
  db().prepare(`
    INSERT INTO notes (id, user_id, title, created_at, duration_seconds, billing_mode, preview_limited, preview_limit_minutes, markdown)
    VALUES (?, ?, ?, ?, ?, 'duration', 0, NULL, ?)
  `).run(id, userRow().id, input.title, new Date().toISOString(), input.durationSeconds, input.markdown);
  return id;
}

export function addJob(input: { title: string; durationSeconds: number; status?: string }) {
  const id = `job_${randomId()}`;
  const now = new Date().toISOString();
  db().prepare(`
    INSERT INTO note_jobs (id, user_id, title, status, error_code, error_message, notes_id, created_at, updated_at, duration_seconds)
    VALUES (?, ?, ?, ?, '', '', NULL, ?, ?, ?)
  `).run(id, userRow().id, input.title, input.status || "queued", now, now, input.durationSeconds);
  return id;
}

/**
 * A cheap fingerprint of the notes list, used as the ETag. The dashboard sends
 * it back on the next poll and gets a 304 when nothing has changed.
 */
export function notesFingerprint() {
  const row = db().prepare(`
    SELECT
      (SELECT COUNT(*) FROM notes WHERE user_id = :id) AS notes,
      (SELECT COUNT(*) FROM note_jobs WHERE user_id = :id) AS jobs,
      (SELECT COALESCE(MAX(created_at), '') FROM notes WHERE user_id = :id) AS newest_note,
      (SELECT COALESCE(MAX(updated_at), '') FROM note_jobs WHERE user_id = :id) AS newest_job
  `).get({ id: userRow().id }) as {
    notes: number;
    jobs: number;
    newest_note: string;
    newest_job: string;
  };
  return `"${row.notes}-${row.jobs}-${row.newest_note}-${row.newest_job}"`;
}

/* --------------------------------------------------------- transcripts --- */

export function listRecoverableTranscripts(page: number, pageSize: number) {
  const database = db();
  const user = userRow();
  const { total } = database
    .prepare("SELECT COUNT(*) AS total FROM transcript_sessions WHERE user_id = ? AND discarded = 0")
    .get(user.id) as { total: number };
  const pagination = paginationFor(page, pageSize, total);
  const rows = database
    .prepare(`
      SELECT id, title, status, mode, segment_count, uploaded_duration_ms, total_duration_ms,
             recovery_reason, recovery_warning, recovery_available_at, updated_at
      FROM transcript_sessions
      WHERE user_id = ? AND discarded = 0
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(user.id, pagination.pageSize, (pagination.page - 1) * pagination.pageSize) as Record<string, unknown>[];

  // The dashboard expects camelCase here, unlike the snake_case notes list.
  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    mode: row.mode,
    segmentCount: row.segment_count,
    uploadedDurationMs: row.uploaded_duration_ms,
    totalDurationMs: row.total_duration_ms,
    recoveryReason: row.recovery_reason,
    recoveryWarning: row.recovery_warning,
    recoveryAvailableAt: row.recovery_available_at,
    updatedAt: row.updated_at
  }));
  return { items, pagination };
}

export function transcriptSession(sessionId: string) {
  return db()
    .prepare("SELECT * FROM transcript_sessions WHERE id = ? AND user_id = ? AND discarded = 0")
    .get(sessionId, userRow().id) as { id: string; title: string; total_duration_ms: number } | undefined;
}

export function discardTranscript(sessionId: string) {
  const result = db()
    .prepare("UPDATE transcript_sessions SET discarded = 1 WHERE id = ? AND user_id = ?")
    .run(sessionId, userRow().id);
  return Number(result.changes) > 0;
}

/* ------------------------------------------------------------- billing --- */

export function pointPackages() {
  return db()
    .prepare(`
      SELECT code, name, price_paise, currency, base_points, bonus_points, total_points
      FROM point_packages ORDER BY sort_order
    `)
    .all() as {
      code: string;
      name: string;
      price_paise: number;
      currency: string;
      base_points: number;
      bonus_points: number;
      total_points: number;
    }[];
}

export function pointPackage(code: string) {
  return pointPackages().find((pack) => pack.code === code) || null;
}

export function paymentGateways() {
  const rows = db()
    .prepare("SELECT code, display_name, provider_type, environment, active, sort_order FROM payment_gateways WHERE active = 1 ORDER BY sort_order")
    .all() as Record<string, unknown>[];
  return rows.map((row) => ({ ...row, active: Boolean(row.active) }));
}

export function billingConfig() {
  const database = db();
  return {
    rule_sets: database.prepare("SELECT id, code, product_code, billing_mode, active FROM billing_rule_sets").all(),
    duration_rules: database
      .prepare(`
        SELECT id, rule_set_code, min_duration_seconds, max_duration_seconds,
               charge_points, label, sort_order, active
        FROM billing_duration_rules
        WHERE active = 1
        ORDER BY sort_order
      `)
      .all(),
    referral_reward: setting("referral_reward", true)
  };
}

/** Points charged for a recording of this length, from the duration rules. */
export function chargeForDuration(durationSeconds: number) {
  const row = db()
    .prepare(`
      SELECT charge_points FROM billing_duration_rules
      WHERE active = 1
        AND min_duration_seconds <= ?
        AND (max_duration_seconds IS NULL OR max_duration_seconds >= ?)
      ORDER BY sort_order
      LIMIT 1
    `)
    .get(durationSeconds, durationSeconds) as { charge_points: number } | undefined;
  return row?.charge_points ?? 1;
}

export function createOrder(input: {
  packageCode: string;
  amountPaise: number;
  currency: string;
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
}) {
  const id = `ord_${randomId()}`;
  db().prepare(`
    INSERT INTO payment_orders (id, user_id, package_code, amount_paise, currency, base_points, bonus_points, total_points, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)
  `).run(
    id,
    userRow().id,
    input.packageCode,
    input.amountPaise,
    input.currency,
    input.basePoints,
    input.bonusPoints,
    input.totalPoints,
    new Date().toISOString()
  );
  return id;
}

export function paymentOrder(orderId: string) {
  return db()
    .prepare("SELECT * FROM payment_orders WHERE id = ? AND user_id = ?")
    .get(orderId, userRow().id) as
      | {
          id: string;
          package_code: string;
          amount_paise: number;
          currency: string;
          base_points: number;
          bonus_points: number;
          total_points: number;
          status: string;
          created_at: string;
        }
      | undefined;
}

/* ------------------------------------------------------------- coupons --- */

export function coupon(code: string) {
  const row = db()
    .prepare("SELECT code, kind, description, percent_off, free_points, active FROM coupons WHERE code = ?")
    .get(code.trim().toUpperCase()) as
      | { code: string; kind: string; description: string; percent_off: number; free_points: number; active: number }
      | undefined;
  return row ? { ...row, active: Boolean(row.active) } : null;
}

export function couponRedeemed(code: string) {
  const row = db()
    .prepare("SELECT 1 AS hit FROM coupon_redemptions WHERE code = ? AND user_id = ?")
    .get(code.toUpperCase(), userRow().id);
  return Boolean(row);
}

export function redeemCoupon(code: string) {
  db()
    .prepare("INSERT INTO coupon_redemptions (code, user_id, redeemed_at) VALUES (?, ?, ?)")
    .run(code.toUpperCase(), userRow().id, new Date().toISOString());
}

/* --------------------------------------------------------------- trial --- */

export function trialStatus() {
  const row = userRow();
  return {
    claimed: Boolean(row.trial_claimed),
    points_amount: row.trial_points,
    phone_e164: row.phone_e164,
    phone_verified: Boolean(row.phone_verified)
  };
}

export function startOtpChallenge(phone: string) {
  const user = userRow();
  db().prepare(`
    INSERT INTO otp_challenges (user_id, phone, code, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET phone = excluded.phone, code = excluded.code, created_at = excluded.created_at
  `).run(user.id, phone, DEMO_OTP, new Date().toISOString());
}

export function otpChallenge() {
  return db()
    .prepare("SELECT phone, code FROM otp_challenges WHERE user_id = ?")
    .get(userRow().id) as { phone: string; code: string } | undefined;
}

export function clearOtpChallenge() {
  db().prepare("DELETE FROM otp_challenges WHERE user_id = ?").run(userRow().id);
}

/** Mark the mobile verified and credit the trial points, once. */
export function claimTrial(phone: string) {
  const user = userRow();
  const alreadyClaimed = Boolean(user.trial_claimed);
  db()
    .prepare("UPDATE users SET phone_e164 = ?, phone_verified = 1, trial_claimed = 1 WHERE id = ?")
    .run(phone, user.id);

  if (alreadyClaimed) {
    return 0;
  }
  creditPoints(user.trial_points);
  addActivity({
    type: "point",
    kind: "grant",
    point_type: "grant",
    points_delta: user.trial_points,
    status: "completed",
    source_id: `trial_${user.id}`,
    reference_id: null
  });
  return user.trial_points;
}

/* ---------------------------------------------------- account deletion --- */

export function deletionRequest() {
  const row = db()
    .prepare("SELECT reason, requested_at, eligible_at FROM account_deletion_requests WHERE user_id = ?")
    .get(userRow().id) as { reason: string; requested_at: string; eligible_at: string } | undefined;
  return row ? { reason: row.reason, requestedAt: row.requested_at, eligibleAt: row.eligible_at } : null;
}

export function requestDeletion(reason: string) {
  const now = new Date();
  const eligible = new Date(now.getTime() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000);
  db().prepare(`
    INSERT INTO account_deletion_requests (user_id, reason, requested_at, eligible_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET reason = excluded.reason, requested_at = excluded.requested_at, eligible_at = excluded.eligible_at
  `).run(userRow().id, reason, now.toISOString(), eligible.toISOString());
  return { reason, requestedAt: now.toISOString(), eligibleAt: eligible.toISOString() };
}

export function revokeDeletion() {
  db().prepare("DELETE FROM account_deletion_requests WHERE user_id = ?").run(userRow().id);
}

/* ------------------------------------------------------------ settings --- */

export function setting(key: string, parseJson = false) {
  const row = db().prepare("SELECT value FROM app_settings WHERE key = ?").get(key) as { value: string } | undefined;
  if (!row) {
    return null;
  }
  return parseJson ? JSON.parse(row.value) : row.value;
}

/* ------------------------------------------------------------- helpers --- */

export function paginationFor(page: number, pageSize: number, total: number): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page: Math.min(Math.max(1, page), totalPages),
    pageSize,
    total,
    totalPages
  };
}

export function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
