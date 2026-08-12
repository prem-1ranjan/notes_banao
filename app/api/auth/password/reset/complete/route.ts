import { NextResponse } from "next/server";

// Demo reset completion. Any non-empty token is accepted.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || "").trim();
  const newPassword = String(body?.new_password || "");

  if (!token) {
    return NextResponse.json({ ok: false, message: "This reset link is invalid or has expired." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: "New password must be at least 8 characters." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
}
