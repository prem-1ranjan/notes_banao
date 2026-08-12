import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { TrialClaimControl, type TrialActionResult } from "./TrialClaimControl";
import { VerifiedTick } from "./VerifiedTick";
import { businessInfo } from "@/lib/business-info";
import type { ReferralReward, TrialStatus, User } from "./types";

export type PasswordChangeInput = {
  current_password: string;
  new_password: string;
};

export type PasswordChangeResult = {
  ok: boolean;
  message: string;
};

export type AccountActionResult = {
  ok: boolean;
  message: string;
};

export type AccountDeletionState = {
  pending: boolean;
  request: { eligibleAt?: string; requestedAt?: string } | null;
};

type ProfilePanelProps = {
  referralReward: ReferralReward | null;
  otpVisible: boolean;
  portalOrigin: string;
  trial: TrialStatus | null;
  user: User;
  deletion: AccountDeletionState | null;
  onPasswordChange: (payload: PasswordChangeInput) => Promise<PasswordChangeResult>;
  onRequestDeletion: (reason: string) => Promise<AccountActionResult>;
  onRevokeDeletion: () => Promise<AccountActionResult>;
  onSendOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
  onVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
};

export function ProfilePanel({
  referralReward,
  otpVisible,
  portalOrigin,
  trial,
  user,
  deletion,
  onPasswordChange,
  onRequestDeletion,
  onRevokeDeletion,
  onSendOtp,
  onVerifyOtp
}: ProfilePanelProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState(false);
  const deletionPending = Boolean(deletion?.pending);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState(false);
  const [referralBusy, setReferralBusy] = useState(false);
  const [referralSignupLink, setReferralSignupLink] = useState("");
  const hasPassword = Boolean(user.has_password);
  const phoneVerified = Boolean(user.phone_verified);
  const trialClaimed = Boolean(trial?.claimed || phoneVerified);
  const referralRewardText = referralReward?.active && referralReward.points_amount > 0
    ? `${referralReward.points_amount.toLocaleString()} NB Points`
    : "the active referral reward";
  const referralLink = referralSignupLink;

  async function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("new_password") || "");
    const confirmPassword = String(data.get("confirm_password") || "");

    setPasswordError(false);
    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("New password and confirmation must match.");
      return;
    }

    setPasswordBusy(true);
    setPasswordMessage(hasPassword ? "Changing password..." : "Setting password...");
    const result = await onPasswordChange({
      current_password: String(data.get("current_password") || ""),
      new_password: newPassword
    });
    setPasswordBusy(false);
    setPasswordError(!result.ok);
    setPasswordMessage(result.message);
    if (result.ok) {
      form.reset();
    }
  }

  async function copyReferralLink() {
    if (!referralLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(referralLink);
      setReferralError(false);
      setReferralMessage("Referral link copied.");
    } catch {
      setReferralError(true);
      setReferralMessage("Could not copy. Select the link and copy manually.");
    }
  }

  async function sendReferralInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const referralEmail = String(data.get("referral_email") || "").trim();
    if (!referralEmail) {
      setReferralError(true);
      setReferralMessage("Enter the email address to invite.");
      return;
    }

    setReferralBusy(true);
    setReferralError(false);
    setReferralMessage("Sending invite...");
    try {
      const response = await apiFetch("/api/referrals/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ referral_email: referralEmail })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || result.error || "Could not send referral invite.");
      }
      setReferralMessage(result.message || "Referral invite sent.");
      setReferralSignupLink(String(result.signup_url || "").trim() || referralLinkFor(portalOrigin, user.email));
      form.reset();
    } catch (error) {
      setReferralError(true);
      setReferralMessage(error instanceof Error ? error.message : "Could not send referral invite.");
    } finally {
      setReferralBusy(false);
    }
  }

  function closeDeleteModal() {
    if (deleteBusy) {
      return;
    }
    setDeleteModalOpen(false);
    setDeleteError(false);
    setDeleteMessage("");
  }

  async function submitDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = deleteReason.trim();
    if (!trimmed) {
      setDeleteError(true);
      setDeleteMessage("Please give a reason to continue.");
      return;
    }
    setDeleteBusy(true);
    setDeleteError(false);
    setDeleteMessage("Submitting request...");
    const result = await onRequestDeletion(trimmed);
    setDeleteBusy(false);
    setDeleteError(!result.ok);
    setDeleteMessage(result.ok ? "" : result.message);
    if (result.ok) {
      setDeleteModalOpen(false);
      setDeleteReason("");
    }
  }

  async function revokeDeletion() {
    setDeleteBusy(true);
    setDeleteError(false);
    setDeleteMessage("Cancelling...");
    const result = await onRevokeDeletion();
    setDeleteBusy(false);
    setDeleteError(!result.ok);
    setDeleteMessage(result.ok ? "Deletion request cancelled. Your account is safe." : result.message);
  }

  return (
    <div className="content-panel profile-panel">
      <div className="panel-header">
        <div>
          <h2>Account details</h2>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div className="profile-item">
          <span>Mobile number</span>
          {phoneVerified ? (
            <strong className="verified-mark">
              <VerifiedTick />
              {user.phone_e164 ? `${user.phone_e164} verified` : "Verified"}
            </strong>
          ) : (
            <strong>Not verified</strong>
          )}
        </div>
        {/* Nothing left to claim once verified — the row above carries the state,
            so the whole trial box goes rather than sitting empty. */}
        {!trialClaimed && (
        <div className="profile-item profile-trial-item">
          <TrialClaimControl
            title="Trial"
            variant="profile"
            otpVisible={otpVisible}
            phoneVerified={phoneVerified}
            phone={user.phone_e164}
            trial={trial}
            onSendOtp={onSendOtp}
            onVerifyOtp={onVerifyOtp}
          />
        </div>
        )}
      </div>

      <div className="profile-action-grid">
        <div className="profile-action-card">
          <div>
            <h3>{hasPassword ? "Change password" : "Set password"}</h3>
            <p>Keep your NotesBanao login secure.</p>
          </div>
          <form method="post" className="password-form profile-password-form" onSubmit={submitPasswordChange}>
            {hasPassword && (
              <label>
                Current password
                <input name="current_password" type="password" autoComplete="current-password" required />
              </label>
            )}
            <label>
              New password
              <input name="new_password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            </label>
            <label>
              Confirm password
              <input name="confirm_password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            </label>
            <div className="form-actions">
              <button className="primary" disabled={passwordBusy} type="submit">
                {hasPassword ? "Change password" : "Set password"}
              </button>
            </div>
          </form>
          <p className={`message ${passwordError ? "error" : passwordMessage ? "success" : ""}`} role="status">{passwordMessage}</p>
        </div>

        <div className="profile-action-card">
          <div>
            <h3>Referral</h3>
            <p>
              Send an invite. You get {referralRewardText} after the referred user signs up within 7 days, verifies their email, and completes their first successful recharge.
            </p>
          </div>
          <form method="post" className="password-form referral-form" onSubmit={sendReferralInvite}>
            <label>
              Referred user email
              <span className="input-action-field">
                <input name="referral_email" type="email" autoComplete="email" placeholder="friend@example.com" required />
                <button className="primary" disabled={referralBusy} type="submit">Send invite</button>
              </span>
            </label>
            <label>
              Signup link
              <span className="input-action-field">
                <input readOnly aria-label="Referral signup link" placeholder="…" title={referralLink || undefined} value={referralLink} />
                <button className="secondary" disabled={!referralLink || referralBusy} onClick={copyReferralLink} type="button">Copy link</button>
              </span>
            </label>
          </form>
          <p className={`message ${referralError ? "error" : referralMessage ? "success" : ""}`} role="status">{referralMessage}</p>
        </div>
      </div>

      <div className="profile-action-card profile-danger-card">
        <div className="profile-danger-copy">
          <h3>Delete my account</h3>
          {deletionPending ? (
            <p role="status">
              Deletion requested. Your account and NB Points will be deleted within 7 working days — cancel any time before then.
            </p>
          ) : (
            <p>Permanently delete your account, notes and NB Points. Only payment records the law requires are kept.</p>
          )}
          <p className={`message ${deleteError ? "error" : deleteMessage ? "success" : ""}`} role="status">{deleteModalOpen ? "" : deleteMessage}</p>
        </div>
        <div className="profile-danger-action">
          {deletionPending ? (
            <button className="secondary" disabled={deleteBusy} onClick={revokeDeletion} type="button">
              Revoke request
            </button>
          ) : (
            <button className="danger" onClick={() => setDeleteModalOpen(true)} type="button">
              Delete my account
            </button>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeDeleteModal}>
          <section
            className="modal-panel profile-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="delete-account-title">Delete your account?</h3>
              <button className="ghost modal-close" aria-label="Close" onClick={closeDeleteModal} type="button">×</button>
            </div>
            <p>
              This permanently deletes your account, notes, transcripts and NB Points within 7 working days.
              You can revoke the request any time before it is processed. Once processed it cannot be undone.
            </p>
            <form method="post" onSubmit={submitDeletion}>
              <label>
                Please tell us why you are leaving <span aria-hidden="true">*</span>
                <textarea
                  name="reason"
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Your reason (required)"
                  required
                />
              </label>
              <div className="form-actions modal-actions">
                <button className="secondary" onClick={closeDeleteModal} type="button" disabled={deleteBusy}>
                  Cancel
                </button>
                <button className="danger" type="submit" disabled={deleteBusy}>
                  Yes, delete my account
                </button>
              </div>
              <p className={`message ${deleteError ? "error" : ""}`} role="status">{deleteModalOpen ? deleteMessage : ""}</p>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function referralLinkFor(origin: string, email: string) {
  const base = safeOrigin(origin) || `https://${businessInfo.domain}`;
  const url = new URL("/", `${base}/`);
  url.searchParams.set("auth", "signup");
  url.searchParams.set("ref", email);
  return url.toString();
}

function safeOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return "";
  }
}
