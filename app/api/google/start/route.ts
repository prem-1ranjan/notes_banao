import { NextResponse } from "next/server";

// Google sign-in needs a real OAuth client and a real auth service, so it is not
// part of this demo build. The login form answers with this message.
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: "Google sign-in is not available in the demo build. Use the email form — any email and any 8-character password works."
    },
    { status: 501 }
  );
}
