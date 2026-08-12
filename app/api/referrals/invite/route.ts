import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { portalUser, setting } from "@/demo-backend/queries";

// Demo referral invite. No email is sent; the response carries the signup link
// the profile page shows, so the copy-link flow still works.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const referralEmail = String(body?.referral_email || "").trim();
  if (!referralEmail.includes("@")) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (referralEmail.toLowerCase() === portalUser().email.toLowerCase()) {
    return NextResponse.json({ ok: false, message: "You cannot refer yourself." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const reward = setting("referral_reward", true) as { points_amount?: number } | null;
  const signupUrl = `${origin}/?auth=signup&ref=${encodeURIComponent(portalUser().email)}`;

  return NextResponse.json({
    ok: true,
    message: `Invite prepared for ${referralEmail}. No email is sent in the demo build — share the link below instead.`,
    signup_url: signupUrl,
    points_amount: reward?.points_amount || 0
  });
}
