"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, postJson } from "@/lib/api-client";

type Mode = "login" | "signup" | "forgot" | "terms" | "verify";

const LOGIN_TITLE = "Sign in to NotesBanao";
const LOGIN_INTRO = "Use the same account in the portal and the Chrome extension.";

function dashboardHref(sourceExtension: boolean) {
  return sourceExtension ? "/dashboard?source=extension&login=1" : "/dashboard?login=1";
}

function termsHref(sourceExtension: boolean) {
  return sourceExtension ? "/?auth=terms&source=extension" : "/?auth=terms";
}

export function LoginClient({ initialMode = "login" }: { initialMode?: Mode }) {
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>(initialMode);
  const initialMessage = search.get("email_verification_sent")
    ? "Check your email to verify your account. After verification, please log in."
    : search.get("error")
      ? "Sign-in callback failed. Please try again."
      : "";
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState(Boolean(search.get("error")));
  const [busy, setBusy] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [portalTermsAccepted, setPortalTermsAccepted] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(false);
    setMessage("");
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(false);
    setMessage("Signing in...");
    try {
      const sourceExtension = search.get("source") === "extension";
      const data = await postJson("/api/auth/login", {
        email: String(form.get("email") || ""),
        password: String(form.get("password") || "")
      });
      if (data.termsRequired) {
        window.location.assign(termsHref(sourceExtension));
        return;
      }
      window.location.assign(dashboardHref(sourceExtension));
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("accepted_terms") !== "yes") {
      setError(true);
      setMessage("Please accept the Terms and Privacy Policy to create an account.");
      return;
    }
    setBusy(true);
    setError(false);
    setMessage("Creating account...");
    try {
      const email = String(form.get("email") || "");
      const referralEmail = String(form.get("referral_email") || search.get("ref") || search.get("referral") || "").trim();
      const data = await postJson("/api/auth/signup", {
        email,
        password: String(form.get("password") || ""),
        accepted_terms: true,
        referral_email: referralEmail || undefined
      });
      if (data.needsEmailVerification) {
        setVerificationEmail(email);
        setMode("verify");
        setMessage("");
        return;
      }
      window.location.assign("/dashboard?signup=1");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(false);
    setMessage("Sending reset link...");
    try {
      const data = await postJson("/api/auth/password/reset/start", {
        email: String(form.get("email") || "")
      });
      setMessage(data.message || "If an account exists for this email, a password reset link has been sent.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not send reset link.");
    } finally {
      setBusy(false);
    }
  }

  async function submitTerms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("accepted") !== "yes") {
      setError(true);
      setMessage("Please accept the Terms and Conditions to continue.");
      return;
    }
    setBusy(true);
    setError(false);
    setMessage("Saving your acceptance...");
    try {
      const sourceExtension = search.get("source") === "extension";
      await postJson("/api/auth/terms/accept", { accepted: true });
      window.location.assign(dashboardHref(sourceExtension));
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  }

  async function startGoogle() {
    setBusy(true);
    setError(false);
    setMessage("Opening Google...");
    try {
      const params = new URLSearchParams();
      if (search.get("source") === "extension") {
        params.set("source", "extension");
      }
      const referralEmail = String(search.get("ref") || search.get("referral") || "").trim();
      if (referralEmail) {
        params.set("ref", referralEmail);
      }
      const response = await apiFetch(`/api/google/start${params.size ? `?${params.toString()}` : ""}`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Google login is not configured.");
      }
      window.location.href = data.authUrl;
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Google login failed.");
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="auth-heading">
        <p className="eyebrow">Account Access</p>
        <h2>{headingForMode(mode)}</h2>
        <p className="panel-intro">{introForMode(mode)}</p>
      </div>

      {mode === "login" ? (
        <form method="post" className="form" onSubmit={submitLogin}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <div className="form-help">
            <button className="inline-link" type="button" onClick={() => switchMode("forgot")}>Forgot password?</button>
          </div>
          <button className="primary" disabled={busy} type="submit">Sign in</button>
        </form>
      ) : mode === "signup" ? (
        <form method="post" className="form" onSubmit={submitSignup}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Referral email<input name="referral_email" type="email" autoComplete="email" defaultValue={search.get("ref") || search.get("referral") || ""} placeholder="Optional" /></label>
          <label className="terms-checkbox">
            <input
              checked={signupTermsAccepted}
              name="accepted_terms"
              onChange={(event) => setSignupTermsAccepted(event.currentTarget.checked)}
              type="checkbox"
              value="yes"
              required
            />
            <span>
              I agree to the <a href="/terms-and-conditions" target="_blank" rel="noreferrer">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </span>
          </label>
          <button className="primary" disabled={busy || !signupTermsAccepted} type="submit">Create account</button>
        </form>
      ) : mode === "verify" ? (
        <div className="verify-notice" role="status">
          <div className="verify-icon" aria-hidden="true">OK</div>
          <h3>Check your email</h3>
          <p>
            We sent a verification link{verificationEmail ? ` to ${verificationEmail}` : ""}.
            Verify your account, then sign in to continue.
          </p>
          <button className="primary" disabled={busy} type="button" onClick={() => switchMode("login")}>Back to sign in</button>
          <button className="ghost" disabled={busy} type="button" onClick={() => switchMode("signup")}>Use a different email</button>
        </div>
      ) : mode === "terms" ? (
        <form method="post" className="form" onSubmit={submitTerms}>
          <label className="terms-checkbox">
            <input
              checked={portalTermsAccepted}
              name="accepted"
              onChange={(event) => setPortalTermsAccepted(event.currentTarget.checked)}
              type="checkbox"
              value="yes"
              required
            />
            <span>
              I agree to the <a href="/terms-and-conditions" target="_blank" rel="noreferrer">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </span>
          </label>
          <button className="primary" disabled={busy || !portalTermsAccepted} type="submit">Continue to portal</button>
        </form>
      ) : (
        <form method="post" className="form" onSubmit={submitForgotPassword}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <button className="primary" disabled={busy} type="submit">Send reset link</button>
          <button className="ghost" disabled={busy} type="button" onClick={() => switchMode("login")}>Back to sign in</button>
        </form>
      )}

      {mode !== "forgot" && mode !== "terms" && mode !== "verify" ? (
        <>
          <div className="form-divider"><span>or</span></div>
          <button className="secondary wide" disabled={busy} type="button" onClick={startGoogle}>Continue with Google</button>
        </>
      ) : null}
      {mode !== "forgot" && mode !== "terms" && mode !== "verify" ? (
        <p className="auth-switch">
          {mode === "login" ? "New to NotesBanao?" : "Already have an account?"}
          <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      ) : null}
      <p className={`message ${error ? "error" : message ? "success" : ""}`} role="status">{message}</p>
    </section>
  );
}

function headingForMode(mode: Mode) {
  if (mode === "terms") {
    return "Terms and Conditions";
  }
  if (mode === "signup") {
    return "Create your NotesBanao account";
  }
  if (mode === "forgot") {
    return "Reset your password";
  }
  if (mode === "verify") {
    return "Verify your NotesBanao account";
  }
  return LOGIN_TITLE;
}

function introForMode(mode: Mode) {
  if (mode === "terms") {
    return "Please review and accept before entering the portal.";
  }
  if (mode === "forgot") {
    return "Enter your email and we will send a password reset link.";
  }
  if (mode === "verify") {
    return "One more step before you can use the portal and Chrome extension.";
  }
  return LOGIN_INTRO;
}
