import type { Metadata } from "next";
import { PublicPageShell } from "../components/PublicPageShell";
import { AccountDeletionForm } from "./AccountDeletionForm";

export const metadata: Metadata = {
  title: "Delete your NotesBanao account",
  description:
    "Request deletion of your NotesBanao account and associated data. We email a confirmation link to verify the request; your account is then permanently deleted within 7 working days."
};

export default function AccountDeletionPage() {
  return (
    <PublicPageShell
      title="Delete your NotesBanao account"
      description="Request permanent deletion of your NotesBanao account and associated data — no sign-in required."
    >
      <section className="panel policy-section">
        <h2>How it works</h2>
        <p>Enter the email address for your NotesBanao account and why you are leaving. We will email you a link to confirm the request — this verifies that the account is yours.</p>
        <p>Once confirmed, your account and personal data — profile, notes, transcript data and NB Points — are <strong>permanently deleted within 7 working days</strong>. Records of any payments you made are kept in de-identified form only as required by Indian tax law and cannot be deleted on request.</p>
        <p>Already signed in? You can also delete your account from <strong>User Profile → Delete my account</strong> in the portal.</p>
      </section>

      <section className="panel policy-section">
        <h2>Request deletion</h2>
        {/* Site key read from the Worker env at request time and passed down, so the
            public key never depends on build-time NEXT_PUBLIC inlining. */}
        <AccountDeletionForm turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || ""} />
      </section>
    </PublicPageShell>
  );
}
