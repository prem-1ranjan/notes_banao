import { ResetPasswordClient } from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = String(params?.token || "").trim();

  return (
    <main className="shell">
      <section className="brand">
        <p className="eyebrow">NotesBanao</p>
        <h1>Reset your password.</h1>
        <p>Keep your account secure with a new password before returning to your lecture notes workspace.</p>
      </section>
      <ResetPasswordClient token={token} />
    </main>
  );
}
