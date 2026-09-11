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



type ProfilePanelProps = {
  referralReward: ReferralReward | null;
  otpVisible: boolean;
  portalOrigin: string;
  trial: TrialStatus | null;
  user: User;

  onPasswordChange: (payload: PasswordChangeInput) => Promise<PasswordChangeResult>;
  onDeleteAccount: () => Promise<AccountActionResult>;

  onSendOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
  onVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
  onPhoneChange: (phone: string) => void;
};

export function ProfilePanel({
  referralReward,
  otpVisible,
  portalOrigin,
  trial,
  user,

  onPasswordChange,
  onDeleteAccount,





  onSendOtp,
  onVerifyOtp,
  onPhoneChange
}: ProfilePanelProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState(false);
  const [referralBusy, setReferralBusy] = useState(false);
  const [referralSignupLink, setReferralSignupLink] = useState("");
  const hasPassword = Boolean(user.has_password);
  const phoneVerified = Boolean(user.phone_verified);
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState(user.phone_e164 || "");
  const [changePhoneLoading, setChangePhoneLoading] = useState(false);
  const [changePhoneMessage, setChangePhoneMessage] = useState("");
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

    setDeleteBusy(true);
    setDeleteError(false);
    setDeleteMessage("Deleting your account...");

    const result = await onDeleteAccount();

    setDeleteBusy(false);

    if (!result.ok) {
      setDeleteError(true);
      setDeleteMessage(result.message);
      return;
    }

    setDeleteModalOpen(false);
  }


  const handleChangePhone = async () => {
    if (!newPhone.trim()) {
      setChangePhoneMessage("Phone number is required.");
      return;
    }

    if (!/^\d{10}$/.test(newPhone.trim())) {
      setChangePhoneMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setChangePhoneLoading(true);
      setChangePhoneMessage("");

      await apiFetch("/api/auth/change-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          phone: newPhone.trim(),
        }),
      });
      onPhoneChange(newPhone.trim());
      setChangePhoneMessage("Phone number updated successfully.");
      setChangePhoneOpen(false);
    } catch (error) {
      setChangePhoneMessage(
          error instanceof Error
              ? error.message
              : "Failed to update phone number."
      );
    } finally {
      setChangePhoneLoading(false);
    }
  };

  return (
    <div className="content-panel profile-panel">
      <div className="panel-header">
        <div>
          <h2>Account details</h2>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <span>First Name</span>
          <strong>{user.first_name || "Not available"}</strong>
        </div>

        <div className="profile-item">
          <span>Last Name</span>
          <strong>{user.last_name || "Not available"}</strong>
        </div>

        <div className="profile-item">
          <span>Email</span>
          <strong>
            {user.email}
            {user.email_verified ? (
                <span className="verified-mark">
          <VerifiedTick />
          Verified
        </span>
            ) : (
                <span className="verification-status">
          Not verified
        </span>
            )}
          </strong>
        </div>

        <div className="profile-item">
          <span>Mobile number</span>

          <strong>
            {user.phone_e164 || "Not available"}

            {user.phone_verified && (
                <span className="verified-mark">
        <VerifiedTick />
        Verified
      </span>
            )}
          </strong>

          <button
              type="button"
              className="change-phone-button"
              onClick={() => {
                setNewPhone(user.phone_e164 || "");
                setChangePhoneMessage("");
                setChangePhoneOpen(true);
              }}
          >
            Change mobile number
          </button>
        </div>

        <div className="profile-item">
          <span>Date of Birth</span>
          <strong>
            {user.date_of_birth
                ? new Date(`${user.date_of_birth}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "Not available"}
          </strong>
        </div>

        <div className="profile-item">
          <span>Mobile verification</span>

          <strong className={phoneVerified ? "verified-mark" : ""}>
            {phoneVerified ? (
                <>
                  <VerifiedTick />
                  Verified
                </>
            ) : (
                "Not verified"
            )}
          </strong>
        </div>
        {changePhoneOpen && (
            <div className="profile-item profile-phone-change">
              <span>New mobile number</span>

              <div>
                <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                />

                <div className="phone-change-actions">
                  <button
                      type="button"
                      onClick={handleChangePhone}
                      disabled={changePhoneLoading}
                  >
                    {changePhoneLoading ? "Saving..." : "Save"}
                  </button>

                  <button
                      type="button"
                      onClick={() => {
                        setChangePhoneOpen(false);
                        setChangePhoneMessage("");
                      }}
                      disabled={changePhoneLoading}
                  >
                    Cancel
                  </button>
                </div>

                {changePhoneMessage && (
                    <small>{changePhoneMessage}</small>
                )}
              </div>
            </div>
        )}

        {!phoneVerified && (
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

            <p>
              Your account will be deactivated immediately. You have 7 days to log back in and recover your account. After 7 days, it will be permanently deleted.
            </p>
          <p className={`message ${deleteError ? "error" : deleteMessage ? "success" : ""}`} role="status">{deleteModalOpen ? "" : deleteMessage}</p>
        </div>
        <div className="profile-danger-action">

            <button className="danger" onClick={() => setDeleteModalOpen(true)} type="button">
              Delete my account
            </button>

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
              Your account will be deactivated immediately.
              You have 7 days to log back in and recover your account.
              After 7 days, it will be permanently deleted.
            </p>
            <form method="post" onSubmit={submitDeletion}>

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
