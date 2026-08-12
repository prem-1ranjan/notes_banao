import { NextResponse } from "next/server";

// Public — redeems the emailed confirmation link. Any non-empty token is
// accepted in the demo build.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: "This confirmation link is invalid or has expired." }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    message: "Your deletion request has been recorded. (Demo build: no account is actually deleted.)"
  });
}
