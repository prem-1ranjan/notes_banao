import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { DEMO_OTP, startOtpChallenge, trialStatus } from "@/demo-backend/queries";

// Demo OTP send. No message goes anywhere — the code is always DEMO_OTP, and it
// is returned as `dev_otp` so the dashboard can show it on screen.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ""))) {
    return NextResponse.json({ ok: false, message: "Enter a valid mobile number." }, { status: 400 });
  }

  if (trialStatus().claimed) {
    return NextResponse.json({
      ok: true,
      can_claim_trial: false,
      status: "already_claimed",
      message: "Trial NB Points have already been claimed on this account."
    });
  }

  startOtpChallenge(phone);
  return NextResponse.json({ ok: true, status: "otp_sent", can_claim_trial: true, dev_otp: DEMO_OTP });
}
