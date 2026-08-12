"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingPanel } from "./components/BillingPanel";
import { DashboardFooter } from "./components/DashboardFooter";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardTopBar } from "./components/DashboardTopBar";
import { DownloadsPanel } from "./components/DownloadsPanel";
import { HomePanel } from "./components/HomePanel";
import { NotesPanel } from "./components/NotesPanel";
import { ProfilePanel, type PasswordChangeInput, type PasswordChangeResult } from "./components/ProfilePanel";
import { type TrialActionResult } from "./components/TrialClaimControl";
import { nbPoints } from "./components/format";
import { WalletPanel, type RechargeOutcome } from "./components/WalletPanel";
import { ApiError, apiFetch, apiJson, isSessionExpired } from "@/lib/api-client";
import { combinedNotesListPagination, isNotesJobInProgress } from "./components/notesJobMessages";

/** Backstop only — the list refreshes on focus and on Refresh. */
const IN_PROGRESS_POLL_MS = 5 * 60 * 1000;
import type {
  BillingDurationRule,
  BillingRuleSet,
  NotesPagination,
  PaymentGateway,
  PointPackage,
  RecentNote,
  RecentNoteJob,
  RecoverableTranscriptSession,
  ReferralReward,
  SectionKey,
  TrialStatus,
  User,
  WalletActivity,
  WalletOverview,
  WalletPagination,
} from "./components/types";

const NOTES_PAGE_SIZE = 8;
const WALLET_ACTIVITY_PAGE_SIZE = 5;
const SECTION_COPY: Record<SectionKey, [string, string]> = {
  home: ["Home", "Pin NotesBanao and generate your first notes from the extension."],
  wallet: ["NB Points", "Available NB Points, trial status, and recent point activity."],
  notes: ["Generated Notes", "Recent generated notes."],
  billing: ["Billing Rule", "Duration-based NB Points charges."],
  profile: ["User Profile", "Account and mobile verification details."],
  downloads: ["Apps & Downloads", "Install NotesBanao on your browser, PC, and phone — all sync to this account."]
};

const DASHBOARD_SECTIONS = new Set<SectionKey>(["home", "wallet", "notes", "billing", "profile", "downloads"]);

function normalizePointPackages(value: unknown): PointPackage[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is PointPackage => (
    Boolean(item) &&
    typeof item === "object" &&
    typeof (item as PointPackage).code === "string" &&
    Number.isFinite(Number((item as PointPackage).price_paise)) &&
    Number.isFinite(Number((item as PointPackage).total_points))
  ));
}

function normalizePaymentGateways(value: unknown): PaymentGateway[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is PaymentGateway => (
    Boolean(item) &&
    typeof item === "object" &&
    typeof (item as PaymentGateway).code === "string" &&
    typeof (item as PaymentGateway).display_name === "string"
  ));
}

function normalizeWalletActivities(value: unknown): WalletActivity[] {
  if (Array.isArray(value)) {
    return value as WalletActivity[];
  }
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: WalletActivity[] }).data;
  }
  return [];
}

function walletActivityPageSize() {
  return WALLET_ACTIVITY_PAGE_SIZE;
}

function normalizeWalletPagination(value: unknown, page: number, pageSize: number, activities: WalletActivity[]): WalletPagination {
  if (value && typeof value === "object") {
    const pagination = value as Partial<WalletPagination>;
    return {
      page: Math.max(1, Number(pagination.page || page) || page),
      pageSize: Math.max(1, Number(pagination.pageSize || pageSize) || pageSize),
      total: Math.max(0, Number(pagination.total || activities.length) || activities.length),
      totalPages: Math.max(1, Number(pagination.totalPages || 1) || 1)
    };
  }
  return {
    page,
    pageSize,
    total: activities.length,
    totalPages: 1
  };
}

export function DashboardClient({ initialUser, portalOrigin }: { initialUser: User; portalOrigin: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const source = search.get("source");
  const requestedSection = normalizeSection(search.get("section"));
  const requestedNoteId = String(search.get("note_id") || "").trim();
  const [user, setUser] = useState(initialUser);
  const [activeSection, setActiveSection] = useState<SectionKey>(requestedSection || "home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [accountDeletion, setAccountDeletion] = useState<{
    pending: boolean;
    request: { eligibleAt?: string; requestedAt?: string } | null;
  } | null>(null);
  // Neutral, always-true default: the dashboard is auth-gated, so if it renders
  // the portal session is real — green dot = "signed in". The "go back to the
  // extension" call-to-action is added only when the user actually arrived from
  // a native client (?source=), since the portal can't observe the extension's
  // presence or login state directly (no beacon / externally_connectable).
  const [message, setMessage] = useState("Signed in to your NotesBanao account.");
  const [error, setError] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [walletOverview, setWalletOverview] = useState<WalletOverview | null>(null);
  const [walletActivityPage, setWalletActivityPage] = useState(1);
  const [walletError, setWalletError] = useState("");
  const [walletLoading, setWalletLoading] = useState(true);
  const [notes, setNotes] = useState<RecentNote[]>([]);
  const [noteJobs, setNoteJobs] = useState<RecentNoteJob[]>([]);
  const [recoverableTranscripts, setRecoverableTranscripts] = useState<RecoverableTranscriptSession[]>([]);
  /** Last notes-list ETag, so a repeat load can ask "has anything changed?". */
  const notesEtag = useRef("");
  /** Supported recording length, from the server so every surface agrees. */
  const [maxRecordingMinutes, setMaxRecordingMinutes] = useState(0);
  const [notesError, setNotesError] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesPagination, setNotesPagination] = useState<NotesPagination>({
    page: 1,
    pageSize: NOTES_PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [jobsPagination, setJobsPagination] = useState<NotesPagination>({
    page: 1,
    pageSize: NOTES_PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const listPagination = combinedNotesListPagination(notesPagination, jobsPagination);
  const [billingRules, setBillingRules] = useState<BillingDurationRule[]>([]);
  const [billingRuleSets, setBillingRuleSets] = useState<BillingRuleSet[]>([]);
  const [referralReward, setReferralReward] = useState<ReferralReward | null>(null);
  const [billingError, setBillingError] = useState("");
  const [billingLoading, setBillingLoading] = useState(true);
  const [rechargePackages, setRechargePackages] = useState<PointPackage[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [rechargePackagesLoading, setRechargePackagesLoading] = useState(true);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeStatus, setRechargeStatus] = useState("");

  function handleSessionExpired() {
    setError(true);
    setMessage("This session was signed out because the account logged in somewhere else.");
    router.replace("/");
  }

  async function loadWalletOverview(page = walletActivityPage) {
    setWalletLoading(true);
    setWalletError("");
    try {
      const pageSize = walletActivityPageSize();
      const data = await apiJson(`/api/wallet/overview?page=${page}&limit=${pageSize}`);
      const activities = normalizeWalletActivities(data.activities);
      setWalletOverview({
        wallet: data.wallet,
        activities,
        pagination: normalizeWalletPagination(data.pagination, page, pageSize, activities)
      });
      setWalletActivityPage(page);
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return;
      }
      setWalletError(err instanceof Error ? err.message : "Could not load NB Points details.");
    } finally {
      setWalletLoading(false);
    }
  }

  async function loadRecentNotes(page = notesPagination.page) {
    setNotesLoading(true);
    setNotesError("");
    try {
      // Conditional: an unchanged list answers 304 with no body, and the
      // backend skips the queries that build it.
      const cachedEtag = notesEtag.current;
      const response = await apiFetch(`/api/notes/recent?page=${page}&limit=${NOTES_PAGE_SIZE}`, {
        headers: cachedEtag ? { "If-None-Match": cachedEtag } : undefined
      });
      if (response.status === 304) {
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new ApiError(
          data.message || data.error || data.detail || "Could not load notes.",
          response.status
        );
      }
      notesEtag.current = response.headers.get("etag") || "";
      setNotes(data.notes || []);
      setNoteJobs(data.jobs || []);
      if (Number(data.maxRecordingMinutes) > 0) {
        setMaxRecordingMinutes(Number(data.maxRecordingMinutes));
      }
      setNotesPagination(data.pagination || {
        page,
        pageSize: NOTES_PAGE_SIZE,
        total: data.notes?.length || 0,
        totalPages: 1
      });
      setJobsPagination(data.jobsPagination || {
        page,
        pageSize: NOTES_PAGE_SIZE,
        total: data.jobs?.length || 0,
        totalPages: 1
      });
      const recoverable = await apiJson(`/api/transcripts/recoverable?page=1&limit=10`);
      setRecoverableTranscripts(recoverable.sessions || []);
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return;
      }
      setNotesError(err instanceof Error ? err.message : "Could not load notes.");
    } finally {
      setNotesLoading(false);
    }
  }

  async function generateRecoveredTranscript(sessionId: string) {
    setError(false);
    setMessage("Creating notes from uploaded transcript...");
    try {
      await apiJson(`/api/transcripts/${encodeURIComponent(sessionId)}/generate`, {
        method: "POST"
      });
      await loadRecentNotes(1);
      setActiveSection("notes");
      setMessage("Notes generation started. The job will appear below.");
      return true;
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return false;
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not create notes from transcript.");
      return false;
    }
  }

  async function discardRecoveredTranscript(sessionId: string) {
    setError(false);
    setMessage("Dismissing recovery item...");
    try {
      await apiJson(`/api/transcripts/${encodeURIComponent(sessionId)}/discard`, {
        method: "POST"
      });
      await loadRecentNotes(listPagination.page);
      setMessage("Recovery item dismissed.");
      return true;
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return false;
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not dismiss recovery item.");
      return false;
    }
  }

  useEffect(() => {
    if (activeSection !== "notes") {
      return;
    }
    const hasInProgressJobs = noteJobs.some((job) => isNotesJobInProgress(job.status));
    if (!hasInProgressJobs) {
      return;
    }
    // A slow backstop, not a live feed. The list refreshes when the user looks
    // at the tab (below) and when they press Refresh; this only catches the
    // case where they leave it open and watch. Cheap now: an unchanged list
    // answers 304.
    const timer = window.setInterval(() => {
      loadRecentNotes(listPagination.page);
    }, IN_PROGRESS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeSection, noteJobs, listPagination.page]);

  // The moment someone actually looks at the tab is the moment the list should
  // be right — worth far more than any timer, and it costs one conditional
  // request that usually comes back 304.
  useEffect(() => {
    if (activeSection !== "notes") {
      return;
    }
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        loadRecentNotes(listPagination.page);
      }
    };
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [activeSection, listPagination.page]);

  async function loadBillingConfig() {
    setBillingLoading(true);
    setBillingError("");
    try {
      const data = await apiJson("/api/billing/config");
      const ruleSets: BillingRuleSet[] = data.rule_sets || [];
      const noteRuleSets = ruleSets.filter((ruleSet) => ruleSet.product_code === "note_generation");
      const activeRuleSetCodes = new Set(noteRuleSets.map((ruleSet) => ruleSet.code));
      const durationRules: BillingDurationRule[] = data.duration_rules || [];
      setBillingRuleSets(noteRuleSets);
      setBillingRules(activeRuleSetCodes.size
        ? durationRules.filter((rule) => activeRuleSetCodes.has(rule.rule_set_code))
        : durationRules);
      setReferralReward(data.referral_reward || null);
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return;
      }
      setBillingError(err instanceof Error ? err.message : "Could not load billing rules.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function loadRechargePackages() {
    setRechargePackagesLoading(true);
    try {
      const data = await apiJson("/api/billing/packages");
      setRechargePackages(normalizePointPackages(data.packages));
      setPaymentGateways(normalizePaymentGateways(data.payment_gateways));
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return;
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not load recharge options.");
    } finally {
      setRechargePackagesLoading(false);
    }
  }

  async function rechargePoints(packageCode: string, gateway: string, couponCode?: string): Promise<RechargeOutcome> {
    setRechargeLoading(true);
    setRechargeStatus("Starting payment...");
    setError(false);
    setMessage("Processing recharge...");
    try {
      const data = await apiJson("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_code: packageCode,
          gateway,
          ...(couponCode ? { coupon_code: couponCode } : {})
        })
      });
      // A real gateway would send the browser away to pay and come back. The
      // demo backend settles the order immediately and returns the updated
      // wallet, so the modal can go straight to its success receipt.
      const activities = normalizeWalletActivities(data.activities);
      setWalletOverview({
        wallet: data.wallet,
        activities,
        pagination: normalizeWalletPagination(data.pagination, 1, walletActivityPageSize(), activities)
      });
      setWalletActivityPage(1);
      setMessage("Recharge completed. NB Points updated.");
      const order = data.order || {};
      return {
        status: "receipt",
        receipt: {
          order_id: String(order.id || ""),
          amount_paise: Number(order.amount_paise || 0),
          currency: String(order.currency || "INR"),
          base_points: Number(order.base_points || 0),
          bonus_points: Number(order.bonus_points || 0),
          total_points: Number(order.total_points || 0)
        }
      };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { status: "stay" };
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Recharge failed.");
      return { status: "stay" };
    } finally {
      setRechargeLoading(false);
      setRechargeStatus("");
    }
  }

  async function claimCoupon(code: string) {
    setError(false);
    setMessage("Claiming coupon...");
    try {
      const data = await apiJson("/api/wallet/coupon/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      await loadWalletOverview(1);
      setMessage(
        typeof data.points_credited === "number"
          ? `Coupon applied. ${data.points_credited} NB Points added.`
          : "Coupon applied. NB Points added."
      );
      return true;
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return false;
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not claim coupon.");
      return false;
    }
  }

  async function deleteNote(noteId: string) {
    setError(false);
    setMessage("Deleting note...");
    try {
      await apiJson(`/api/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" });
      const nextPage = notes.length === 1 && notesPagination.page > 1
        ? notesPagination.page - 1
        : notesPagination.page;
      await loadRecentNotes(nextPage);
      setMessage("Note deleted.");
      return true;
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return false;
      }
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not delete note.");
      return false;
    }
  }

  async function changePassword(payload: PasswordChangeInput): Promise<PasswordChangeResult> {
    setError(false);
    setMessage(user.has_password ? "Changing password..." : "Setting password...");
    try {
      const data = await apiJson("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setUser((currentUser) => ({
        ...currentUser,
        has_password: true
      }));
      const successMessage = data.message || (user.has_password ? "Password changed." : "Password set.");
      setMessage(successMessage);
      return { ok: true, message: successMessage };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { ok: false, message: "Login required." };
      }
      const errorMessage = err instanceof Error ? err.message : "Could not update password.";
      setError(true);
      setMessage(errorMessage);
      return { ok: false, message: errorMessage };
    }
  }

  async function loadAccountDeletion() {
    try {
      const data = await apiJson("/api/account/deletion-request");
      setAccountDeletion({ pending: Boolean(data.pending), request: data.request || null });
    } catch {
      // Non-fatal: the profile page just won't show a pending banner.
    }
  }

  async function requestAccountDeletion(reason: string): Promise<{ ok: boolean; message: string }> {
    try {
      const data = await apiJson("/api/account/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      setAccountDeletion({ pending: true, request: data.request || null });
      return { ok: true, message: "Deletion request submitted." };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { ok: false, message: "Login required." };
      }
      return { ok: false, message: err instanceof Error ? err.message : "Could not submit deletion request." };
    }
  }

  async function revokeAccountDeletion(): Promise<{ ok: boolean; message: string }> {
    try {
      await apiJson("/api/account/deletion-request/revoke", { method: "POST" });
      setAccountDeletion({ pending: false, request: null });
      return { ok: true, message: "Deletion request cancelled." };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { ok: false, message: "Login required." };
      }
      return { ok: false, message: err instanceof Error ? err.message : "Could not revoke deletion request." };
    }
  }

  useEffect(() => {
    let alive = true;

    if (source === "extension") {
      setMessage("Dashboard opened from the NotesBanao extension.");
    } else if (source === "desktop") {
      setMessage("Dashboard opened from the NotesBanao app.");
    }
    if (requestedSection) {
      setActiveSection(requestedSection);
      if (requestedSection === "notes") {
        setMessage(requestedNoteId ? "Your generated notes are ready below." : "Generated notes are available below.");
      }
    }

    apiJson("/api/trial/status")
      .then((data) => {
        if (alive) {
          setTrial(data);
        }
      })
      .catch((err) => {
        if (!alive) {
          return;
        }
        if (isSessionExpired(err)) {
          handleSessionExpired();
          return;
        }
        setError(true);
        setMessage(err instanceof Error ? err.message : "Could not load trial status.");
      });

    loadWalletOverview();
    loadRecentNotes(1);
    loadBillingConfig();
    loadRechargePackages();
    loadAccountDeletion();

    return () => {
      alive = false;
    };
  }, [router, source, requestedSection, requestedNoteId]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
  }

  async function sendOtp(event: FormEvent<HTMLFormElement>): Promise<TrialActionResult> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "");
    setPendingPhone(phone);
    setError(false);
    setMessage("Sending OTP...");
    try {
      const data = await apiJson("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      if (data.can_claim_trial === false || data.status !== "otp_sent") {
        const status = await apiJson("/api/trial/status").catch(() => null);
        if (status) {
          setTrial(status);
        }
        setOtpVisible(false);
        const text = data.message || "Trial NB Points cannot be claimed with this mobile number.";
        setMessage(text);
        // The number itself is unusable (already claimed or linked elsewhere), so
        // there is nothing to wait for — let it be corrected straight away.
        return { ok: false, message: text, holdNumber: false };
      }
      setOtpVisible(true);
      const text = data.dev_otp
        ? `OTP sent on WhatsApp. Dev OTP: ${data.dev_otp}`
        : "OTP sent on WhatsApp. Check your WhatsApp messages for the code.";
      setMessage(text);
      return { ok: true, message: text, holdNumber: true };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { ok: false, message: "Your session expired. Please sign in again." };
      }
      setError(true);
      const text = err instanceof Error ? err.message : "Could not send OTP.";
      setMessage(text);
      // A code may still have gone out before the error, so hold the number.
      return { ok: false, message: text, holdNumber: true };
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>): Promise<TrialActionResult> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(false);
    setMessage("Verifying OTP...");
    try {
      await apiJson("/api/trial/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: pendingPhone, otp: String(form.get("otp") || "") })
      });
      const status = await apiJson("/api/trial/status");
      setUser((currentUser) => ({
        ...currentUser,
        phone_e164: status.phone_e164 || currentUser.phone_e164,
        phone_verified: Boolean(status.phone_verified)
      }));
      setTrial(status);
      setOtpVisible(false);
      const text = `Mobile verified. ${nbPoints(status.points_amount)} NB Points added to your account.`;
      setMessage(text);
      loadWalletOverview(1);
      return { ok: true, message: text };
    } catch (err) {
      if (isSessionExpired(err)) {
        handleSessionExpired();
        return { ok: false, message: "Your session expired. Please sign in again." };
      }
      setError(true);
      const text = err instanceof Error ? err.message : "Could not verify OTP.";
      setMessage(text);
      return { ok: false, message: text };
    }
  }

  return (
    <main className={`portal-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <DashboardSidebar
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        error={error}
        message={message}
        user={user}
        walletOverview={walletOverview}
        onSectionChange={setActiveSection}
        onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />

      <section className="portal-workspace">
        <DashboardTopBar
          title={SECTION_COPY[activeSection][0]}
          subtitle={SECTION_COPY[activeSection][1]}
          user={user}
          onLogout={logout}
        />
        <section className="portal-content">
          {activeSection === "home" && (
            <HomePanel />
          )}
          {activeSection === "downloads" && (
            <DownloadsPanel />
          )}
          {activeSection === "wallet" && (
            <WalletPanel
              phoneVerified={user.phone_verified}
              phone={user.phone_e164}
              trial={trial}
              walletError={walletError}
              walletLoading={walletLoading}
              walletOverview={walletOverview}
              notes={notes}
              otpVisible={otpVisible}
              rechargePackages={rechargePackages}
              paymentGateways={paymentGateways}
              rechargePackagesLoading={rechargePackagesLoading}
              rechargeLoading={rechargeLoading}
              rechargeStatus={rechargeStatus}
              onActivityPageChange={loadWalletOverview}
              onRefresh={() => loadWalletOverview(1)}
              onRecharge={rechargePoints}
              onClaimCoupon={claimCoupon}
              onSendOtp={sendOtp}
              onVerifyOtp={verifyOtp}
            />
          )}
          {activeSection === "notes" && (
            <NotesPanel
              notes={notes}
              jobs={noteJobs}
              recoverableTranscripts={recoverableTranscripts}
              notesError={notesError}
              notesLoading={notesLoading}
              pagination={listPagination}
              notesTotal={notesPagination.total}
              jobsTotal={jobsPagination.total}
              maxRecordingMinutes={maxRecordingMinutes}
              userEmail={user.email}
              onDelete={deleteNote}
              onDiscardRecoveredTranscript={discardRecoveredTranscript}
              onGenerateRecoveredTranscript={generateRecoveredTranscript}
              onPageChange={loadRecentNotes}
              onRefresh={() => loadRecentNotes(listPagination.page)}
            />
          )}
          {activeSection === "billing" && (
            <BillingPanel
              billingError={billingError}
              billingLoading={billingLoading}
              ruleSets={billingRuleSets}
              rules={billingRules}
            />
          )}
          {activeSection === "profile" && (
            <ProfilePanel
              otpVisible={otpVisible}
              portalOrigin={portalOrigin}
              referralReward={referralReward}
              trial={trial}
              user={user}
              deletion={accountDeletion}
              onPasswordChange={changePassword}
              onRequestDeletion={requestAccountDeletion}
              onRevokeDeletion={revokeAccountDeletion}
              onSendOtp={sendOtp}
              onVerifyOtp={verifyOtp}
            />
          )}
        </section>
      </section>
      <DashboardFooter />
    </main>
  );
}

function normalizeSection(value: string | null): SectionKey | null {
  const section = String(value || "").trim();
  return DASHBOARD_SECTIONS.has(section as SectionKey) ? section as SectionKey : null;
}
