"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export function ResetPasswordClient({ token }: { token: string }) {
  const [message, setMessage] = useState(token ? "" : "Password reset link is missing or invalid.");
  const [error, setError] = useState(!token);
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("new_password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");
    setError(false);
    if (newPassword !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("Resetting password...");
    try {
      const response = await apiFetch("/api/auth/password/reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: newPassword
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Could not reset password.");
      }
      setComplete(true);
      setMessage(data.message || "Password reset. Please log in with your new password.");
      formElement.reset();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="auth-heading">
        <p className="eyebrow">{complete ? "Password updated" : "Account Access"}</p>
        <h2>{complete ? "Password reset" : "Create a new password"}</h2>
        <p className="panel-intro">
          {complete ? "Use your new password to sign in." : "Choose a new password for your NotesBanao account."}
        </p>
      </div>

      {complete ? (
        <Link className="primary link-button wide" href="/">
          Login
        </Link>
      ) : (
        <form method="post" className="form" onSubmit={submitReset}>
          <label>New password<input name="new_password" type="password" autoComplete="new-password" minLength={8} required disabled={!token || busy} /></label>
          <label>Confirm password<input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required disabled={!token || busy} /></label>
          <button className="primary" disabled={!token || busy} type="submit">Reset password</button>
        </form>
      )}

      <p className={`message ${error ? "error" : message ? "success" : ""}`} role="status">{message}</p>
    </section>
  );
}
