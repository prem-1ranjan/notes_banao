import { NextResponse } from "next/server";

// Demo password reset. No email is sent. The reply is deliberately the same
// whether or not the address exists, which is how the real endpoint avoids
// telling a stranger which emails have accounts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email || "").trim();
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    message: "If an account exists for this email, a password reset link has been sent. (Demo build: no email is actually sent — open /reset-password?token=demo-token to try the next screen.)"
  });
}
