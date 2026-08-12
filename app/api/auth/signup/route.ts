import { NextResponse } from "next/server";
import { signIn } from "@/demo-backend/session";

// Demo signup. The real portal emails a verification link and makes the user
// come back; here the account is "created" and signed in straight away.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.accepted_terms !== true) {
      return NextResponse.json(
        { ok: false, message: "Please accept the Terms and Privacy Policy to create an account." },
        { status: 400 }
      );
    }
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");
    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await signIn(email);
    return NextResponse.json({ ok: true, user, needsEmailVerification: false });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Signup failed." },
      { status: 400 }
    );
  }
}
