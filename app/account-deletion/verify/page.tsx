import type { Metadata } from "next";
import { PublicPageShell } from "../../components/PublicPageShell";
import { AccountDeletionVerify } from "./AccountDeletionVerify";

export const metadata: Metadata = {
  title: "Confirm account deletion | NotesBanao",
  description: "Confirm your NotesBanao account deletion request."
};

export default async function AccountDeletionVerifyPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <PublicPageShell
      title="Confirm account deletion"
      description="One more step to confirm your NotesBanao account deletion request."
    >
      <section className="panel policy-section">
        <AccountDeletionVerify token={token || ""} />
      </section>
    </PublicPageShell>
  );
}
