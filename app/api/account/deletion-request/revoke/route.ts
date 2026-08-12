import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { revokeDeletion } from "@/demo-backend/queries";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }
  revokeDeletion();
  return NextResponse.json({ ok: true, pending: false });
}
