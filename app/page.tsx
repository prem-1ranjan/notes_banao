import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthDrawer } from "./components/AuthDrawer";
import { LandingFooter } from "./components/LandingFooter";
import { LandingHero } from "./components/LandingHero";
import { LandingNav } from "./components/LandingNav";
import { LandingSections } from "./components/LandingSections";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ auth?: string; source?: string; ref?: string; referral?: string }>;
}) {
  const params = await searchParams;
  const wantsTerms = params?.auth === "terms";
  const sourceExtension = params?.source === "extension";
  const user = await getCurrentUser();
  if (user) {
    if (!user.terms_accepted_current) {
      if (!wantsTerms) {
        redirect(sourceExtension ? "/?auth=terms&source=extension" : "/?auth=terms");
      }
    } else {
      redirect(sourceExtension ? "/dashboard?source=extension" : "/dashboard");
    }
  }
  const authMode = params?.auth === "signup"
    ? "signup"
    : params?.auth === "terms"
      ? "terms"
      : "login";
  const showAuth = params?.auth === "login" || params?.auth === "signup" || params?.auth === "terms";
  const sourceQuery = authQuery(params);
  const closeTarget = sourceQuery ? `/?${sourceQuery.slice(1)}` : "/";
  const closeHref = wantsTerms ? `/auth/cancel?next=${encodeURIComponent(closeTarget)}` : closeTarget;

  return (
    <main className="landing-page">
      <LandingNav sourceQuery={sourceQuery} />
      <LandingHero />
      {showAuth ? <AuthDrawer closeHref={closeHref} initialMode={authMode} /> : null}
      <LandingSections />
      <LandingFooter />
    </main>
  );
}

function authQuery(params?: { source?: string; ref?: string; referral?: string }) {
  const query = new URLSearchParams();
  if (params?.source === "extension") {
    query.set("source", "extension");
  }
  const referral = String(params?.ref || params?.referral || "").trim();
  if (referral) {
    query.set("ref", referral);
  }
  const text = query.toString();
  return text ? `&${text}` : "";
}
