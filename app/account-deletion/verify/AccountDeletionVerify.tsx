"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export function AccountDeletionVerify({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  async function confirm() {
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      const response = await apiFetch("/api/public/account-deletion/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "This confirmation link is invalid or has expired.");
      }
      setDone(true);
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "This confirmation link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return <p className="message error" role="status">This confirmation link is missing its token. Please use the link from your email.</p>;
  }

  if (done) {
    return (
      <>
        <h2>Deletion confirmed</h2>
        <p>Your account and personal data will be permanently deleted within 7 working days. Records of any payments you made are kept in de-identified form only as required by law.</p>
        <p>Changed your mind? Sign in and open <strong>User Profile → Delete my account</strong> to revoke the request any time before it is processed.</p>
      </>
    );
  }

  return (
    <>
      <h2>Confirm your account deletion</h2>
      <p>Click below to confirm you want to permanently delete your NotesBanao account and personal data. This starts a 7-working-day deletion you can still cancel from the portal.</p>
      <div className="public-form-actions">
        <button className="danger" type="button" onClick={confirm} disabled={busy}>
          {busy ? "Confirming…" : "Confirm account deletion"}
        </button>
      </div>
      {message ? <p className={`message ${error ? "error" : ""}`} role="status">{message}</p> : null}
    </>
  );
}
