import { redirect } from "next/navigation";
import { businessInfo } from "@/lib/business-info";
import { getCurrentUser } from "@/lib/session";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ source?: string; section?: string; note_id?: string }>;
}) {
  const params = await searchParams;
  const sourceExtension = params?.source === "extension";
  const user = await getCurrentUser();
  if (!user) {
    redirect(sourceExtension ? "/?source=extension" : "/");
  }
  if (!user.terms_accepted_current) {
    redirect(sourceExtension ? "/?auth=terms&source=extension" : "/?auth=terms");
  }
  return <DashboardClient initialUser={user} portalOrigin={portalOrigin()} />;
}

function portalOrigin() {
  const raw = String(process.env.PUBLIC_PORTAL_ORIGIN || "").trim() || `https://${businessInfo.domain}`;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return `https://${businessInfo.domain}`;
  }
}
