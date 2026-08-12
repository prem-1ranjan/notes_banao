import { useEffect, useState, type FormEvent } from "react";
import { VerifiedTick } from "./VerifiedTick";
import { nbPoints } from "./format";
import type { TrialStatus } from "./types";

export type TrialActionResult = {
  ok: boolean;
  message: string;
  /** Hold the number for the OTP window instead of letting it be retyped at once. */
  holdNumber?: boolean;
};

type TrialClaimControlProps = {
  heading?: boolean;
  title?: string;
  variant?: "default" | "profile";
  otpVisible: boolean;
  phoneVerified: boolean;
  phone?: string | null;
  trial: TrialStatus | null;
  onSendOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
  onVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
};

/** Matches OTP_EXPIRE_MINUTES on the backend — the code is dead after this anyway. */
const HOLD_MS = 5 * 60 * 1000;

function countdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function TrialClaimControl({
  heading = true,
  title = "Trial Status",
  variant = "default",
  otpVisible,
  phoneVerified,
  phone,
  trial,
  onSendOtp,
  onVerifyOtp
}: TrialClaimControlProps) {
  const claimed = Boolean(trial?.claimed || phoneVerified);
  const trialPoints = trial ? nbPoints(trial.points_amount) : "trial NB Points";
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [result, setResult] = useState<TrialActionResult | null>(null);
  // Once a code has gone out the number is held for the life of that code, so a
  // mistyped number cannot be swapped for another one send after send.
  const [holdUntil, setHoldUntil] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!holdUntil) {
      return;
    }
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [holdUntil]);

  const holdRemaining = holdUntil ? Math.max(0, holdUntil - now) : 0;
  const phoneHeld = holdRemaining > 0;
  const holdReleased = holdUntil > 0 && holdRemaining === 0;

  // The handler is called synchronously so it can still read event.currentTarget;
  // only the waiting happens afterwards.
  function submit(
    kind: "send" | "verify",
    handler: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>
  ) {
    return (event: FormEvent<HTMLFormElement>) => {
      if (busy) {
        event.preventDefault();
        return;
      }
      setBusy(kind);
      setResult(null);
      handler(event)
        .then((outcome) => {
          setResult(outcome);
          if (kind === "send" && outcome.holdNumber) {
            setHoldUntil(Date.now() + HOLD_MS);
          }
        })
        .catch(() => setResult({ ok: false, message: "Something went wrong. Please try again." }))
        .finally(() => setBusy(null));
    };
  }

  if (claimed) {
    return (
      <div className={`trial-claim-control ${variant === "profile" ? "profile-trial-control" : ""}`}>
        {/* Not the `title` prop: once claimed this card is about the verified
            number, not trial status, so it is labelled for what it now shows. */}
        {heading && (
          <div className="trial-status-row">
            <h3>Mobile number</h3>
          </div>
        )}
        <p className="verified-mark">
          <VerifiedTick />
          <span>{phone ? `${phone} verified` : "Mobile verified"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`trial-claim-control ${variant === "profile" ? "profile-trial-control" : ""}`}>
      {heading && (
        <div className="trial-status-row">
          <h3>{title}</h3>
          <span className="status-badge">Trial available</span>
        </div>
      )}
      <p className="trial-points-copy">{`Verify mobile once to claim ${trialPoints} NB Points.`}</p>
      <div className="otp-forms">
        <form className="trial-form compact-form" onSubmit={submit("send", onSendOtp)}>
          <label>WhatsApp number<input name="phone" type="tel" placeholder="9876543210" required disabled={busy !== null || phoneHeld} /></label>
          <button className="primary" type="submit" disabled={busy !== null || phoneHeld}>
            {busy === "send" ? "Sending…" : "Send OTP on WhatsApp"}
          </button>
        </form>
        {otpVisible && (
          <form className="trial-form compact-form" onSubmit={submit("verify", onVerifyOtp)}>
            <label>OTP<input name="otp" inputMode="numeric" required disabled={busy !== null} /></label>
            <button className="primary" type="submit" disabled={busy !== null}>
              {busy === "verify" ? "Verifying…" : "Verify & claim"}
            </button>
          </form>
        )}
        {result && (
          <p className={`trial-result ${result.ok ? "" : "trial-result-error"}`}>{result.message}</p>
        )}
        {phoneHeld && (
          <p className="trial-result">
            {`Wrong number? You can enter a different one in ${countdown(holdRemaining)}.`}
          </p>
        )}
        {holdReleased && (
          <p className="trial-result">You can now enter a different number and send a new code.</p>
        )}
      </div>
    </div>
  );
}
