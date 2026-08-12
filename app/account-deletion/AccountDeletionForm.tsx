"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (id?: string) => void;
};

function turnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

export function AccountDeletionForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Load + render the Cloudflare Turnstile widget when a site key is configured.
  useEffect(() => {
    if (!turnstileSiteKey) {
      return;
    }
    const SCRIPT_ID = "cf-turnstile-script";

    function render() {
      const api = turnstile();
      if (!api || !widgetRef.current || widgetId.current) {
        return;
      }
      widgetId.current = api.render(widgetRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken("")
      });
    }

    if (turnstile()) {
      render();
      return;
    }
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    return () => script?.removeEventListener("load", render);
  }, [turnstileSiteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !reason.trim()) {
      setError(true);
      setMessage("Please enter your email and a reason.");
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      setError(true);
      setMessage("Please complete the verification challenge.");
      return;
    }
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      const response = await apiFetch("/api/public/account-deletion/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), reason: reason.trim(), turnstileToken: captchaToken })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Could not submit the request.");
      }
      setDone(true);
      setMessage(data.message || "If an account exists for that email, we have sent a confirmation link. Please check your inbox.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Could not submit the request.");
      // A used/failed token can't be reused — reset the widget for a retry.
      if (turnstileSiteKey) {
        turnstile()?.reset(widgetId.current || undefined);
        setCaptchaToken("");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="message success" role="status">{message}</p>;
  }

  return (
    <form className="public-form" method="post" onSubmit={submit}>
      <label>
        Account email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>
      <label>
        Why are you leaving? <span aria-hidden="true">*</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Your reason (required)"
          required
        />
      </label>
      {turnstileSiteKey ? <div ref={widgetRef} className="cf-turnstile-widget" /> : null}
      <div className="public-form-actions">
        <button className="danger" type="submit" disabled={busy}>
          {busy ? "Sending confirmation…" : "Request account deletion"}
        </button>
      </div>
      {message ? <p className={`message ${error ? "error" : ""}`} role="status">{message}</p> : null}
    </form>
  );
}
