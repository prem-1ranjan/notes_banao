import { NextResponse } from "next/server";
import { signIn } from "@/demo-backend/session";

// Demo sign-in: any email plus any password of 8+ characters works. There is no
// auth service in this build, so nothing is checked against a real account.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 8 characters. In this demo build any password of that length works." },
        { status: 400 }
      );
    }

    const user = await signIn(email);
    if (!user.terms_accepted_current) {
      return NextResponse.json({ ok: true, user, termsRequired: true });
    }
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Login failed." },
      { status: 400 }
    );
  }
}
