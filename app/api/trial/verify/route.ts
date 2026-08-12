import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { claimTrial, clearOtpChallenge, otpChallenge } from "@/demo-backend/queries";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const otp = String(body?.otp || "").trim();
  const challenge = otpChallenge();
  if (!challenge) {
    return NextResponse.json({ ok: false, message: "Request a new code first." }, { status: 400 });
  }
  if (otp !== challenge.code) {
    return NextResponse.json({ ok: false, message: "That code is not correct." }, { status: 400 });
  }

  const pointsCredited = claimTrial(challenge.phone);
  clearOtpChallenge();
  return NextResponse.json({ ok: true, points_credited: pointsCredited });
}
