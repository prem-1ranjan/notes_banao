import { NextResponse } from "next/server";

// Public, no login required — this is the deletion URL listed on the app store
// pages. The real endpoint emails a confirmation link and always answers with
// the same generic message so it cannot be used to discover which addresses
// have accounts. The demo keeps that behaviour, minus the email.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email || "").trim();
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    message: "If an account exists for this email, a confirmation link has been sent. (Demo build: no email is sent.)"
  });
}
