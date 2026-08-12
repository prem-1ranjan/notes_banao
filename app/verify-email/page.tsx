import Link from "next/link";

export const dynamic = "force-dynamic";

// Landing page for the "verify your email" link. The demo backend does not send
// email and does not issue verification tokens, so any non-empty token is
// treated as valid — enough to work on the page itself.
export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = String(params?.token || "").trim();
  const result = verifyEmail(token);

  return (
    <main className="shell verify-shell">
      <section className="brand">
        <p className="eyebrow">NotesBanao</p>
        <h1>Email verification</h1>
        <p>Secure your account access before using NB Points and portal features.</p>
      </section>
      <section className="panel">
        <div className="auth-heading">
          <p className="eyebrow">{result.ok ? "Verified" : "Action needed"}</p>
          <h2>{result.ok ? result.heading : "Verification failed"}</h2>
          <p className="panel-intro">{result.message}</p>
        </div>
        <Link className="primary link-button wide" href="/">
          Login
        </Link>
      </section>
    </main>
  );
}

function verifyEmail(token: string) {
  if (!token) {
    return {
      ok: false,
      heading: "Verification failed",
      message: "Verification link is missing or invalid."
    };
  }
  return {
    ok: true,
    heading: "Email verified",
    message: "Your email is verified. Please log in to continue."
  };
}
