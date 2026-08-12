import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { listActivities, walletSummary } from "@/demo-backend/queries";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") || 10) || 10, 20));
  const { items, pagination } = listActivities(page, limit);

  return NextResponse.json({
    ok: true,
    wallet: walletSummary(),
    activities: items,
    pagination
  });
}
