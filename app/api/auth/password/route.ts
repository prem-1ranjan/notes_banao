import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { setHasPassword } from "@/demo-backend/queries";

// Demo password change. No password is ever stored — the only thing that
// changes is the account's `has_password` flag, which is what the profile UI
// reacts to.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const newPassword = String(body?.new_password || "");
  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: "New password must be at least 8 characters." }, { status: 400 });
  }
  if (user.has_password && !String(body?.current_password || "")) {
    return NextResponse.json({ ok: false, message: "Enter your current password." }, { status: 400 });
  }

  const wasSet = user.has_password;
  setHasPassword(true);
  return NextResponse.json({ ok: true, message: wasSet ? "Password changed." : "Password set." });
}
