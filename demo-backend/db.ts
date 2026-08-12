/**
 * The demo database.
 *
 * This build of the portal has no backend service. Instead it keeps everything
 * in a local SQLite file (`demo.db` in the project root), read and written
 * through Node's built-in `node:sqlite` driver — no npm package, no native
 * build step.
 *
 * Lifecycle:
 *  1. First request opens `demo.db`, creating the file if it does not exist.
 *  2. The schema below is applied (every statement is `IF NOT EXISTS`, so this
 *     is safe to run on every boot).
 *  3. If the database has no user yet, it is seeded from `demo-backend/data/*.json`.
 *
 * Because it is a real file, your data survives a server restart. To start over:
 *
 *     npm run db:reset
 *
 * Requires Node 22.5 or newer (that is when `node:sqlite` arrived).
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import seedUser from "@/demo-backend/data/user.json";
import seedWallet from "@/demo-backend/data/wallet.json";
import seedNotes from "@/demo-backend/data/notes.json";
import seedBilling from "@/demo-backend/data/billing.json";
import seedPackages from "@/demo-backend/data/packages.json";
import seedCoupons from "@/demo-backend/data/coupons.json";
import seedTranscripts from "@/demo-backend/data/transcripts.json";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id                     TEXT PRIMARY KEY,
  email                  TEXT NOT NULL,
  email_verified         INTEGER NOT NULL DEFAULT 0,
  has_password           INTEGER NOT NULL DEFAULT 1,
  phone_e164             TEXT,
  phone_verified         INTEGER NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'active',
  terms_accepted_current INTEGER NOT NULL DEFAULT 1,
  balance_points         INTEGER NOT NULL DEFAULT 0,
  reserved_points        INTEGER NOT NULL DEFAULT 0,
  trial_points           INTEGER NOT NULL DEFAULT 0,
  trial_claimed          INTEGER NOT NULL DEFAULT 0
);

-- One row per NB Points movement (a payment, a grant, or notes usage).
CREATE TABLE IF NOT EXISTS wallet_activities (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id),
  type                  TEXT NOT NULL,
  kind                  TEXT NOT NULL,
  point_type            TEXT NOT NULL,
  amount_paise          INTEGER NOT NULL DEFAULT 0,
  base_points           INTEGER,
  bonus_points          INTEGER,
  total_points          INTEGER,
  points_delta          INTEGER,
  balance_after_points  INTEGER,
  reserved_after_points INTEGER,
  currency              TEXT NOT NULL DEFAULT 'INR',
  status                TEXT NOT NULL,
  provider              TEXT,
  provider_order_id     TEXT,
  source_id             TEXT NOT NULL,
  reference_id          TEXT,
  note_title            TEXT,
  duration_seconds      INTEGER,
  created_at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_user_created
  ON wallet_activities (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notes (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id),
  title                TEXT NOT NULL,
  created_at           TEXT NOT NULL,
  duration_seconds     INTEGER NOT NULL DEFAULT 0,
  billing_mode         TEXT NOT NULL DEFAULT 'duration',
  preview_limited      INTEGER NOT NULL DEFAULT 0,
  preview_limit_minutes INTEGER,
  markdown             TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes (user_id, created_at DESC);

-- A notes-generation job. Jobs that succeed point at the note they produced.
CREATE TABLE IF NOT EXISTS note_jobs (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id),
  title            TEXT NOT NULL,
  status           TEXT NOT NULL,
  error_code       TEXT NOT NULL DEFAULT '',
  error_message    TEXT NOT NULL DEFAULT '',
  notes_id         TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON note_jobs (user_id, created_at DESC);

-- Transcripts that were uploaded but never turned into notes, so the dashboard
-- can offer to recover them.
CREATE TABLE IF NOT EXISTS transcript_sessions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id),
  title                 TEXT NOT NULL,
  status                TEXT NOT NULL,
  mode                  TEXT NOT NULL,
  segment_count         INTEGER NOT NULL DEFAULT 0,
  uploaded_duration_ms  INTEGER NOT NULL DEFAULT 0,
  total_duration_ms     INTEGER NOT NULL DEFAULT 0,
  recovery_reason       TEXT NOT NULL DEFAULT '',
  recovery_warning      TEXT NOT NULL DEFAULT '',
  recovery_available_at TEXT,
  updated_at            TEXT NOT NULL,
  discarded             INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS point_packages (
  code         TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  price_paise  INTEGER NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'INR',
  base_points  INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  code          TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  environment   TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  package_code TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'INR',
  base_points  INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL,
  status       TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

-- What a note costs, by recording length.
CREATE TABLE IF NOT EXISTS billing_rule_sets (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  product_code TEXT NOT NULL,
  billing_mode TEXT NOT NULL,
  active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS billing_duration_rules (
  id                   TEXT PRIMARY KEY,
  rule_set_code        TEXT NOT NULL REFERENCES billing_rule_sets(code),
  min_duration_seconds INTEGER NOT NULL,
  max_duration_seconds INTEGER,
  charge_points        INTEGER NOT NULL,
  label                TEXT NOT NULL,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  active               INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coupons (
  code        TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  percent_off INTEGER NOT NULL DEFAULT 0,
  free_points INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  code        TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  redeemed_at TEXT NOT NULL,
  PRIMARY KEY (code, user_id)
);

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  user_id      TEXT PRIMARY KEY REFERENCES users(id),
  reason       TEXT NOT NULL DEFAULT '',
  requested_at TEXT NOT NULL,
  eligible_at  TEXT NOT NULL
);

-- The pending mobile-verification code. Always DEMO_OTP in this build.
CREATE TABLE IF NOT EXISTS otp_challenges (
  user_id    TEXT PRIMARY KEY REFERENCES users(id),
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Small key/value settings the portal reads at runtime (referral reward,
-- retention window, maximum recording length).
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

const DB_KEY = Symbol.for("notesbanao.portal.demo.db");
type GlobalWithDb = typeof globalThis & { [DB_KEY]?: DatabaseSync };

export function databaseFile() {
  const configured = String(process.env.DEMO_DB_PATH || "").trim();
  return configured || path.join(process.cwd(), "demo.db");
}

/**
 * The shared connection. Held on globalThis so Next's dev-mode hot reload
 * reuses one handle instead of opening a new one on every file save.
 */
export function db(): DatabaseSync {
  const scope = globalThis as GlobalWithDb;
  if (!scope[DB_KEY]) {
    assertSqliteSupport();
    const database = new DatabaseSync(databaseFile());
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(SCHEMA);
    seedIfEmpty(database);
    scope[DB_KEY] = database;
  }
  return scope[DB_KEY];
}

/** Close the handle so the file can be deleted or re-seeded. */
export function closeDb() {
  const scope = globalThis as GlobalWithDb;
  scope[DB_KEY]?.close();
  delete scope[DB_KEY];
}

/** Empty every table and load `demo-backend/data/*.json` again. */
export function reseed() {
  const database = db();
  database.exec(`
    DELETE FROM otp_challenges;
    DELETE FROM account_deletion_requests;
    DELETE FROM coupon_redemptions;
    DELETE FROM coupons;
    DELETE FROM billing_duration_rules;
    DELETE FROM billing_rule_sets;
    DELETE FROM payment_orders;
    DELETE FROM payment_gateways;
    DELETE FROM point_packages;
    DELETE FROM transcript_sessions;
    DELETE FROM note_jobs;
    DELETE FROM notes;
    DELETE FROM wallet_activities;
    DELETE FROM app_settings;
    DELETE FROM users;
  `);
  seed(database);
}

function seedIfEmpty(database: DatabaseSync) {
  const row = database.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (!row?.count) {
    seed(database);
  }
}

function seed(database: DatabaseSync) {
  // Seed timestamps are fixed in the JSON, so shift them all by the same amount:
  // the most recent seeded event lands a couple of minutes ago and the demo
  // never looks like it was abandoned last year.
  const shift = timeShift();
  const userId = seedUser.id;

  database.prepare(`
    INSERT INTO users (
      id, email, email_verified, has_password, phone_e164, phone_verified,
      status, terms_accepted_current, balance_points, reserved_points,
      trial_points, trial_claimed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    userId,
    seedUser.email,
    bool(seedUser.email_verified),
    bool(seedUser.has_password),
    seedUser.phone_e164,
    bool(seedUser.phone_verified),
    seedUser.status,
    bool(seedUser.terms_accepted_current),
    seedWallet.balance_points,
    seedWallet.reserved_points,
    seedWallet.trial_points
  );

  const insertActivity = database.prepare(`
    INSERT INTO wallet_activities (
      id, user_id, type, kind, point_type, amount_paise, base_points, bonus_points,
      total_points, points_delta, balance_after_points, reserved_after_points,
      currency, status, provider, provider_order_id, source_id, reference_id,
      note_title, duration_seconds, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const activity of seedWallet.activities) {
    insertActivity.run(
      activity.id,
      userId,
      activity.type,
      activity.kind,
      activity.point_type,
      activity.amount_paise,
      nullableInt(activity.base_points),
      nullableInt(activity.bonus_points),
      nullableInt(activity.total_points),
      nullableInt(activity.points_delta),
      nullableInt(activity.balance_after_points),
      nullableInt(activity.reserved_after_points),
      activity.currency,
      activity.status,
      activity.provider,
      activity.provider_order_id,
      activity.source_id,
      activity.reference_id,
      "note_title" in activity ? activity.note_title ?? null : null,
      "duration_seconds" in activity ? nullableInt(activity.duration_seconds) : null,
      shift(activity.created_at)
    );
  }

  const insertNote = database.prepare(`
    INSERT INTO notes (
      id, user_id, title, created_at, duration_seconds, billing_mode,
      preview_limited, preview_limit_minutes, markdown
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const note of seedNotes.notes) {
    insertNote.run(
      note.id,
      userId,
      note.title,
      shift(note.created_at),
      note.duration_seconds,
      note.billing_mode,
      bool(note.preview_limited),
      nullableInt(note.preview_limit_minutes),
      note.markdown
    );
  }

  const insertJob = database.prepare(`
    INSERT INTO note_jobs (
      id, user_id, title, status, error_code, error_message, notes_id,
      created_at, updated_at, duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const job of seedNotes.jobs) {
    insertJob.run(
      job.id,
      userId,
      job.title,
      job.status,
      job.error_code,
      job.error_message,
      job.notes_id,
      shift(job.created_at),
      shift(job.updated_at),
      job.duration_seconds
    );
  }

  const insertSession = database.prepare(`
    INSERT INTO transcript_sessions (
      id, user_id, title, status, mode, segment_count, uploaded_duration_ms,
      total_duration_ms, recovery_reason, recovery_warning, recovery_available_at,
      updated_at, discarded
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  for (const session of seedTranscripts) {
    insertSession.run(
      session.id,
      userId,
      session.title,
      session.status,
      session.mode,
      session.segmentCount,
      session.uploadedDurationMs,
      session.totalDurationMs,
      session.recoveryReason,
      session.recoveryWarning,
      session.recoveryAvailableAt ? shift(session.recoveryAvailableAt) : null,
      shift(session.updatedAt)
    );
  }

  const insertPackage = database.prepare(`
    INSERT INTO point_packages (code, name, price_paise, currency, base_points, bonus_points, total_points, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  seedPackages.packages.forEach((pack, index) => {
    insertPackage.run(
      pack.code,
      pack.name,
      pack.price_paise,
      pack.currency,
      pack.base_points,
      pack.bonus_points,
      pack.total_points,
      index
    );
  });

  const insertGateway = database.prepare(`
    INSERT INTO payment_gateways (code, display_name, provider_type, environment, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const gateway of seedPackages.payment_gateways) {
    insertGateway.run(
      gateway.code,
      gateway.display_name,
      gateway.provider_type,
      gateway.environment,
      bool(gateway.active),
      gateway.sort_order
    );
  }

  const insertRuleSet = database.prepare(`
    INSERT INTO billing_rule_sets (id, code, product_code, billing_mode, active) VALUES (?, ?, ?, ?, ?)
  `);
  for (const ruleSet of seedBilling.rule_sets) {
    insertRuleSet.run(ruleSet.id, ruleSet.code, ruleSet.product_code, ruleSet.billing_mode, ruleSet.active);
  }

  const insertRule = database.prepare(`
    INSERT INTO billing_duration_rules (
      id, rule_set_code, min_duration_seconds, max_duration_seconds,
      charge_points, label, sort_order, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const rule of seedBilling.duration_rules) {
    insertRule.run(
      rule.id,
      rule.rule_set_code,
      rule.min_duration_seconds,
      nullableInt(rule.max_duration_seconds),
      rule.charge_points,
      rule.label,
      rule.sort_order,
      rule.active
    );
  }

  const insertCoupon = database.prepare(`
    INSERT INTO coupons (code, kind, description, percent_off, free_points, active) VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const coupon of seedCoupons) {
    insertCoupon.run(
      coupon.code,
      coupon.kind,
      coupon.description,
      coupon.percent_off,
      coupon.free_points,
      bool(coupon.active)
    );
  }

  const insertSetting = database.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)");
  insertSetting.run("retention_days", String(seedNotes.retentionDays));
  insertSetting.run("max_recording_minutes", String(seedNotes.maxRecordingMinutes));
  insertSetting.run("referral_reward", JSON.stringify(seedBilling.referral_reward));
}

function timeShift() {
  const seeded = [
    ...seedWallet.activities.map((row) => row.created_at),
    ...seedNotes.notes.map((row) => row.created_at),
    ...seedNotes.jobs.map((row) => row.updated_at)
  ]
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));

  const newest = seeded.length ? Math.max(...seeded) : Date.now();
  const delta = Date.now() - newest - 2 * 60 * 1000;
  return (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed + delta).toISOString() : value;
  };
}

function bool(value: unknown) {
  return value ? 1 : 0;
}

function nullableInt(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}

function assertSqliteSupport() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const supported = major > 22 || (major === 22 && minor >= 5);
  if (!supported) {
    throw new Error(
      `This demo portal stores its data in SQLite through Node's built-in node:sqlite module, ` +
      `which needs Node 22.5 or newer. You are on Node ${process.versions.node}. ` +
      `Install the current Node LTS from https://nodejs.org and try again.`
    );
  }
}
