import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { deletionRequest, requestDeletion } from "@/demo-backend/queries";

// Current deletion state, for the banner on the User Profile page.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }
  const request = deletionRequest();
  return NextResponse.json({ ok: true, pending: Boolean(request), request });
}

// Submit an account-deletion request. Nothing is deleted in the demo build —
// the request is recorded so the pending/revoke states can be worked on.
export async function POST(httpRequest: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const body = await httpRequest.json().catch(() => ({}));
  const reason = String(body?.reason || "").trim();
  if (!reason) {
    return NextResponse.json({ ok: false, message: "Tell us why you are leaving." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, pending: true, request: requestDeletion(reason) });
}
