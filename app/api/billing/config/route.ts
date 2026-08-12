import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { billingConfig } from "@/demo-backend/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...billingConfig() });
}
